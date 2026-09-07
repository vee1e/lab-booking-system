#pragma once
// BookingSystem: owns all lists, enforces all rules.
// Links: owns gear/users/logs (composition), log points to gear/user by id (link).
#include <vector>
#include <string>
#include <algorithm>
#include "Equipment.h"
#include "User.h"
#include "Booking.h"
#include "Types.h"

class BookingSystem {
private:
    // Private lists: outside code cannot touch vectors directly.
    std::vector<Equipment*> stock;  // all gear, owned here
    std::vector<User*> users;       // all people, owned here
    std::vector<Booking> logs;      // all borrows, owned by value

    // Private helper: count open borrows for a user.
    int openCount(int userId) const {
        return std::count_if(logs.begin(), logs.end(), [userId](const Booking& b) {
            return b.getUserId() == userId && !b.isReturned();
        });
    }

    // Private helper: who holds a taken item, for verbose msg.
    int holderOf(int eqId) const {
        for (auto& b : logs)
            if (b.getEquipmentId() == eqId && !b.isReturned()) return b.getUserId();
        return -1;
    }

public:
    // End: free all owned gear and users.
    ~BookingSystem() {
        for (auto* e : stock) delete e;
        for (auto* u : users) delete u;
    }

    // Add face.
    void addEquipment(Equipment* e) { stock.push_back(e); }
    void addUser(User* u) { users.push_back(u); }

    // Build gear from one spec pack (struct use).
    // If value <= 0 the short birth form runs with default spec.
    Result addFromSpec(const GearSpec& s) {
        if (s.kind == "microscope") {
            if (s.value <= 0) addEquipment(new Microscope(s.name, s.brand));
            else addEquipment(new Microscope(s.name, s.brand, s.value));
        }
        else if (s.kind == "centrifuge") {
            if (s.value <= 0) addEquipment(new Centrifuge(s.name, s.brand));
            else addEquipment(new Centrifuge(s.name, s.brand, s.value));
        }
        else if (s.kind == "spectrometer") {
            if (s.value <= 0) addEquipment(new Spectrometer(s.name, s.brand));
            else addEquipment(new Spectrometer(s.name, s.brand, s.value));
        }
        else return {false, "FAIL: kind must be microscope, centrifuge, or spectrometer. Got '" + s.kind + "'."};
        return {true, "OK: added " + s.kind + " '" + s.name + "' brand '" + s.brand + "'."};
    }

    // Find face.
    Equipment* findEquipment(int id) {
        for (auto* e : stock) if (e->getId() == id) return e;
        return nullptr;
    }
    User* findUser(int id) {
        for (auto* u : users) if (u->getId() == id) return u;
        return nullptr;
    }

    // Borrow: verbose for every case.
    Result borrow(int userId, int eqId, int today) {
        User* u = findUser(userId);
        if (!u) return {false, "FAIL: no user with id " + std::to_string(userId) + ". Login first with menu 1."};
        Equipment* e = findEquipment(eqId);
        if (!e) return {false, "FAIL: no gear with id " + std::to_string(eqId) + ". See menu 2 for valid ids."};
        if (!e->isAvailable()) {
            int h = holderOf(eqId);
            return {false, "FAIL: '" + e->getName() + "' is TAKEN" +
                           (h >= 0 ? " by user " + std::to_string(h) : "") +
                           ". Pick another id from menu 2."};
        }
        int open = openCount(userId);
        if (open >= u->getMaxItems())
            return {false, "FAIL: " + u->getName() + " (" + u->getRole() + ") holds " +
                           std::to_string(open) + ", max is " + std::to_string(u->getMaxItems()) +
                           ". Return something first."};
        logs.push_back(Booking(eqId, userId, today, u->getLoanDays()));
        e->markBorrowed();
        return {true, "OK: " + u->getName() + " took '" + e->getName() + "' [" + e->getType() + "]" +
                       " on day " + std::to_string(today) +
                       ". Due day " + std::to_string(logs.back().getDueDay()) +
                       " (loan " + std::to_string(u->getLoanDays()) + " days for " + u->getRole() + ")."};
    }

    // Return: verbose for every case.
    Result giveBack(int userId, int eqId, int today) {
        for (auto& b : logs) {
            if (b.getUserId() == userId && b.getEquipmentId() == eqId && !b.isReturned()) {
                User* u = findUser(userId);
                int rate = u ? u->getFinePerDay() : 10;
                b.close(today, rate);
                if (Equipment* e = findEquipment(eqId)) e->markReturned();
                if (b.getFine() > 0)
                    return {true, "OK but LATE: day " + std::to_string(today) + " is past due " +
                                   std::to_string(b.getDueDay()) + ". Fine=" + std::to_string(b.getFine()) +
                                   " (" + std::to_string(today - b.getDueDay()) + " days x " +
                                   std::to_string(rate) + "/day)."};
                return {true, "OK: returned on time on day " + std::to_string(today) +
                               ". Due was " + std::to_string(b.getDueDay()) + ". No fine."};
            }
        }
        return {false, "FAIL: no OPEN booking for user " + std::to_string(userId) +
                       " + gear " + std::to_string(eqId) + ". Check menu 8 for open logs."};
    }

    // Shared list shape: header with count, empty note, one line each.
    template <typename T, typename F>
    static void printList(const char* title, const std::vector<T>& items, const char* emptyMsg, F text) {
        std::cout << "--- " << title << " (" << items.size() << ") ---\n";
        if (items.empty()) { std::cout << emptyMsg << "\n"; return; }
        for (const auto& it : items) std::cout << text(it) << "\n";
    }

    // Lists: always print header + count.
    void listEquipment() const {
        printList("gear list", stock, "Empty. Admin can add via menu 9.",
                  [](Equipment* e) { return e->detailLine(); });
    }
    void listUsers() const {
        printList("user list", users, "Empty. Nothing to show.",
                  [](User* u) { return u->line(); });
    }
    void listBookings() const {
        printList("booking log", logs, "No bookings yet. Borrow via menu 3.",
                  [](const Booking& b) { return b.line(); });
    }

    // Search overload 1: by word in name or type.
    void search(const std::string& key) const {
        std::cout << "--- search word '" << key << "' ---\n";
        bool hit = false;
        for (auto* e : stock) {
            if (e->getName().find(key) != std::string::npos ||
                e->getType().find(key) != std::string::npos) {
                std::cout << *e << "\n";
                hit = true;
            }
        }
        if (!hit) std::cout << "No match for '" << key << "'. Try 'Micro', 'Centri', or brand.\n";
    }
    // Search overload 2: by id.
    void search(int id) {
        std::cout << "--- search id " << id << " ---\n";
        Equipment* e = findEquipment(id);
        if (e) std::cout << *e << "\n";
        else std::cout << "FAIL: no gear with id " << id << ". See menu 2 for live ids 101 and up.\n";
    }

    // Remove: only if free. Verbose result.
    Result removeEquipment(int id) {
        for (auto it = stock.begin(); it != stock.end(); ++it) {
            if ((*it)->getId() == id) {
                if (!(*it)->isAvailable())
                    return {false, "FAIL: id " + std::to_string(id) + " is TAKEN. Return it before remove."};
                std::string n = (*it)->getName();
                delete *it;
                stock.erase(it);
                return {true, "OK: removed id " + std::to_string(id) + " ('" + n + "')."};
            }
        }
        return {false, "FAIL: no gear with id " + std::to_string(id) + ". See menu 2 for live ids."};
    }

    // Demo data: 3 gear + year 1,2,3 students + staff.
    // Priyanshu uses the short Student birth (defaults to year 1).
    void seed() {
        addEquipment(new Microscope("Olympus CX23", "Olympus", 1000));
        addEquipment(new Centrifuge("Eppendorf 5424", "Eppendorf", 15000));
        addEquipment(new Spectrometer("UV-1800", "Shimadzu", 1100));
        addUser(new Student("Priyanshu"));
        addUser(new Student("Arjun-Y2", 2));
        addUser(new Student("Lakshit-Y3", 3));
        addUser(new Faculty("Gowda"));
        addUser(new LabAdmin("Ansh"));
    }
};
