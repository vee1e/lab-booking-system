# Shared Laboratory Equipment Booking System

C++ OOP project: book lab gear via a text menu. No database.

## Build

```
g++ -std=c++17 -Wall main.cpp -o labbook
./labbook
```

## Files

* `Equipment.h` - Equipment base plus Microscope, Centrifuge, Spectrometer
* `User.h` - User base plus Student (year 1-3), Faculty, LabAdmin
* `Booking.h` - one borrow record
* `BookingSystem.h` - owns all lists, borrow and return rules
* `Types.h` - shared Result and GearSpec structs
* `main.cpp` - menu loop
