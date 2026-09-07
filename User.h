#pragma once
// User hierarchy: base + Student / Faculty / LabAdmin.
// Shows: inheritance, polymorphism, access levels, year 1-3 rule.
#include <iostream>
#include <string>

// Base user: id + name, role rules left to children.
class User {
private:
    // Private: no outside change after birth.
    int userId;             // tag like 1
    std::string name;       // full name
    static int nextUserId;  // shared id counter

protected:
    // Protected: only children build via this.
    User(const std::string& n) : userId(nextUserId++), name(n) {}

public:
    virtual ~User() {}

    // Public read face.
    int getId() const { return userId; }
    std::string getName() const { return name; }

    // Role rules: each child defines its own numbers.
    virtual std::string getRole() const = 0;
    virtual int getMaxItems() const = 0;
    virtual int getLoanDays() const = 0;
    virtual int getFinePerDay() const = 0;

    // Verbose line for lists.
    virtual std::string line() const {
        return "[" + std::to_string(userId) + "] " + name + " (" + getRole() + ")";
    }

    // Operator overload: print user with << .
    friend std::ostream& operator<<(std::ostream& os, const User& u) {
        os << u.line();
        return os;
    }
};

// Student: year 1, 2, 3 changes quota. Higher year gets more.
class Student : public User {
private:
    int studyYear;  // 1, 2, or 3

public:
    // Constructor overload 1: name only, year defaults to 1.
    Student(const std::string& n) : User(n), studyYear(1) {}
    // Constructor overload 2: name + year.
    Student(const std::string& n, int year) : User(n) {
        if (year < 1) year = 1;
        if (year > 3) year = 3;
        studyYear = year;
    }

    std::string getRole() const override { return "Student"; }
    // Year rule: year1=2 items, year2=3, year3=4.
    int getMaxItems() const override { return 1 + studyYear; }
    int getLoanDays() const override { return 7; }
    int getFinePerDay() const override { return 10; }
    std::string line() const override {
        return "[" + std::to_string(getId()) + "] " + getName() +
               " (Student year " + std::to_string(studyYear) +
               " max=" + std::to_string(getMaxItems()) + ")";
    }
};

// Faculty: fixed high quota.
class Faculty : public User {
public:
    Faculty(const std::string& n) : User(n) {}
    std::string getRole() const override { return "Faculty"; }
    int getMaxItems() const override { return 5; }
    int getLoanDays() const override { return 14; }
    int getFinePerDay() const override { return 5; }
};

// Admin: can hold most, pays no fine, runs add/remove.
class LabAdmin : public User {
public:
    LabAdmin(const std::string& n) : User(n) {}
    std::string getRole() const override { return "LabAdmin"; }
    int getMaxItems() const override { return 10; }
    int getLoanDays() const override { return 30; }
    int getFinePerDay() const override { return 0; }
};
