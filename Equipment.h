#pragma once
// Equipment hierarchy: base + 3 children.
// Shows: inheritance, polymorphism, encapsulation, abstraction.
#include <iostream>
#include <string>
#include "Types.h"

// Base class: one lab item.
class Equipment {
private:
    // Private: only this class touches these directly.
    int id;                 // tag like 101
    std::string name;       // model name
    std::string brand;      // maker
    bool available;         // true = FREE
    int timesBorrowed;      // counter for popularity
    static int nextId;      // shared counter for ids

protected:
    // Protected: children can read but outside code cannot.
    Equipment(const std::string& n, const std::string& b)
        : id(nextId++), name(n), brand(b), available(true), timesBorrowed(0) {}

public:
    // Virtual end: children clean up safely via base pointer.
    virtual ~Equipment() {}

    // Read-only face: no set methods, state changes only via borrow/return.
    int getId() const { return id; }
    std::string getName() const { return name; }
    std::string getBrand() const { return brand; }
    bool isAvailable() const { return available; }
    int getTimesBorrowed() const { return timesBorrowed; }

    // State change: only BookingSystem should call these.
    void markBorrowed() { available = false; timesBorrowed++; }
    void markReturned() { available = true; }

    // Pure virtual: each child must define its own.
    virtual std::string getType() const = 0;
    virtual std::string detailLine() const = 0;

    // One print path for all gear.
    void showDetails() const { std::cout << detailLine() << "\n"; }

    // Operator overload: print with << .
    friend std::ostream& operator<<(std::ostream& os, const Equipment& e) {
        os << e.detailLine();
        return os;
    }
};

// Child 1: microscope adds magnification.
class Microscope : public Equipment {
private:
    int magnification;  // e.g. 1000x

public:
    // Constructor overload 1: full spec.
    Microscope(const std::string& n, const std::string& b, int mag)
        : Equipment(n, b), magnification(mag) {}
    // Constructor overload 2: default mag via default arg style.
    Microscope(const std::string& n, const std::string& b)
        : Equipment(n, b), magnification(400) {}

    std::string getType() const override { return "Microscope"; }
    std::string detailLine() const override {
        return "[" + std::to_string(getId()) + "] " + getName() + " (Microscope) brand=" + getBrand() +
               " mag=" + std::to_string(magnification) + "x " +
               (isAvailable() ? "FREE" : "TAKEN") +
               " borrowed=" + std::to_string(getTimesBorrowed()) + "x";
    }
};

// Child 2: centrifuge adds max rpm.
class Centrifuge : public Equipment {
private:
    int maxRpm;  // top speed

public:
    Centrifuge(const std::string& n, const std::string& b, int rpm)
        : Equipment(n, b), maxRpm(rpm) {}
    Centrifuge(const std::string& n, const std::string& b)
        : Equipment(n, b), maxRpm(10000) {}

    std::string getType() const override { return "Centrifuge"; }
    std::string detailLine() const override {
        return "[" + std::to_string(getId()) + "] " + getName() + " (Centrifuge) brand=" + getBrand() +
               " max=" + std::to_string(maxRpm) + "rpm " +
               (isAvailable() ? "FREE" : "TAKEN") +
               " borrowed=" + std::to_string(getTimesBorrowed()) + "x";
    }
};

// Child 3: spectrometer adds range in nm.
class Spectrometer : public Equipment {
private:
    int maxNm;  // top of range

public:
    Spectrometer(const std::string& n, const std::string& b, int nm)
        : Equipment(n, b), maxNm(nm) {}
    Spectrometer(const std::string& n, const std::string& b)
        : Equipment(n, b), maxNm(1100) {}

    std::string getType() const override { return "Spectrometer"; }
    std::string detailLine() const override {
        return "[" + std::to_string(getId()) + "] " + getName() + " (Spectrometer) brand=" + getBrand() +
               " range=" + std::to_string(maxNm) + "nm " +
               (isAvailable() ? "FREE" : "TAKEN") +
               " borrowed=" + std::to_string(getTimesBorrowed()) + "x";
    }
};
