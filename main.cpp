// Main menu: clear screen on move, verbose every step.
#include <iostream>
#include <limits>
#include "BookingSystem.h"

// Static counters: one shared id source per class.
int Equipment::nextId = 101;
int User::nextUserId = 1;
int Booking::nextBookingId = 5001;

// Clear screen on every menu move.
void clearScreen() {
    // ANSI clear: works on Mac, Linux, new Windows terminal.
    std::cout << "\033[2J\033[H";
}

// Read int + eat rest of line.
int readInt(const std::string& msg) {
    int v;
    std::cout << msg;
    std::cin >> v;
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    return v;
}

// Read full line.
std::string readLine(const std::string& msg) {
    std::string s;
    std::cout << msg;
    std::getline(std::cin, s);
    return s;
}

// Small pause so verbose msg stays on screen.
void pause() {
    std::cout << "[enter to go on]";
    std::string s;
    std::getline(std::cin, s);
}

int main() {
    // Start: system + demo rows.
    BookingSystem sys;
    sys.seed();
    int today = 1;      // fake day counter, keeps fine math simple
    int loginId = -1;   // -1 = none logged in

    clearScreen();
    std::cout << "Shared Laboratory Equipment Booking System\n";
    std::cout << "Day=" << today << ". Users: 1 Priyanshu-Y1, 2 Arjun-Y2, 3 Lakshit-Y3, 4 Gowda, 5 Ansh.\n";

    // Loop: each pick clears screen first.
    while (true) {
        std::cout << "\n--- day " << today << " user ";
        if (loginId < 0) std::cout << "none";
        else std::cout << loginId;
        std::cout << " ---\n";
        std::cout << "1 login  2 list gear  3 borrow  4 return  5 logs\n";
        std::cout << "6 search word  7 search id  8 users  9 admin add  10 admin remove\n";
        std::cout << "0 next day  -1 exit\n";
        int ch = readInt("pick: ");
        clearScreen();

        // Exit and day move.
        if (ch == -1) { std::cout << "Bye. Log left on screen above.\n"; break; }
        if (ch == 0) { today++; std::cout << "OK: moved to day " << today << ".\n"; continue; }

        // Login.
        if (ch == 1) {
            sys.listUsers();
            loginId = readInt("user id: ");
            User* u = sys.findUser(loginId);
            if (u) std::cout << "OK: logged in as " << *u << ". Loan " << u->getLoanDays()
                             << " days, max " << u->getMaxItems() << ".\n";
            else { std::cout << "FAIL: no user " << loginId << ".\n"; loginId = -1; }
            pause(); clearScreen(); continue;
        }
        // List gear.
        if (ch == 2) { sys.listEquipment(); pause(); clearScreen(); continue; }
        // Borrow.
        if (ch == 3) {
            if (loginId < 0) { std::cout << "FAIL: login first via menu 1.\n"; pause(); clearScreen(); continue; }
            sys.listEquipment();
            int eid = readInt("equipment id: ");
            Result r = sys.borrow(loginId, eid, today);
            std::cout << r.msg << "\n";
            pause(); clearScreen(); continue;
        }
        // Return.
        if (ch == 4) {
            if (loginId < 0) { std::cout << "FAIL: login first via menu 1.\n"; pause(); clearScreen(); continue; }
            int eid = readInt("equipment id to give back: ");
            Result r = sys.giveBack(loginId, eid, today);
            std::cout << r.msg << "\n";
            pause(); clearScreen(); continue;
        }
        // Logs.
        if (ch == 5) { sys.listBookings(); pause(); clearScreen(); continue; }
        // Search word (function overload 1).
        if (ch == 6) {
            std::string k = readLine("word: ");
            sys.search(k);
            pause(); clearScreen(); continue;
        }
        // Search id (function overload 2).
        if (ch == 7) {
            int id = readInt("id: ");
            sys.search(id);
            pause(); clearScreen(); continue;
        }
        // Users.
        if (ch == 8) { sys.listUsers(); pause(); clearScreen(); continue; }
        // Admin add via struct pack.
        if (ch == 9) {
            std::cout << "kinds: microscope / centrifuge / spectrometer\n";
            GearSpec s;
            s.kind = readLine("kind: ");
            s.name = readLine("name: ");
            s.brand = readLine("brand: ");
            s.value = readInt("spec number (mag/rpm/nm): ");
            Result r = sys.addFromSpec(s);
            std::cout << r.msg << "\n";
            pause(); clearScreen(); continue;
        }
        // Admin remove.
        if (ch == 10) {
            sys.listEquipment();
            int id = readInt("id to remove: ");
            Result r = sys.removeEquipment(id);
            std::cout << r.msg << "\n";
            pause(); clearScreen(); continue;
        }
        // Bad pick.
        std::cout << "FAIL: bad pick '" << ch << "'. Use -1 to 10.\n";
        pause(); clearScreen();
    }
    return 0;
}
