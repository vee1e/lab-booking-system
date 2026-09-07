#pragma once
// Booking: links one user to one item by ids.
// Shows: encapsulation, open state via sentinel, operator overload.
#include <iostream>
#include <string>

class Booking {
private:
    // Private: set once, closed once, never edited raw.
    int bookingId;    // tag like 5001
    int equipmentId;  // gear tag
    int userId;       // user tag
    int issueDay;     // borrow day
    int dueDay;       // last free day
    int returnDay;    // -1 = still out
    int fine;         // money due on late return
    static int nextBookingId;  // shared counter

public:
    // Single birth form: loan span always comes from the user role.
    Booking(int eqId, int uId, int today, int loanDays)
        : bookingId(nextBookingId++), equipmentId(eqId), userId(uId),
          issueDay(today), dueDay(today + loanDays),
          returnDay(-1), fine(0) {}

    // Read face.
    int getId() const { return bookingId; }
    int getEquipmentId() const { return equipmentId; }
    int getUserId() const { return userId; }
    int getDueDay() const { return dueDay; }
    bool isReturned() const { return returnDay != -1; }
    int getFine() const { return fine; }

    // Close: mark back, work out fine if late.
    void close(int today, int finePerDay) {
        returnDay = today;
        if (today > dueDay) fine = (today - dueDay) * finePerDay;
    }

    // Verbose line for logs.
    std::string line() const {
        std::string s = "B" + std::to_string(bookingId) +
                        " gear=" + std::to_string(equipmentId) +
                        " user=" + std::to_string(userId) +
                        " issue=" + std::to_string(issueDay) +
                        " due=" + std::to_string(dueDay);
        if (returnDay != -1) s += " back=" + std::to_string(returnDay) + " fine=" + std::to_string(fine);
        else s += " OPEN";
        return s;
    }

    // Operator overload: print with << .
    friend std::ostream& operator<<(std::ostream& os, const Booking& b) {
        os << b.line();
        return os;
    }
};
