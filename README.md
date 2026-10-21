# Shared Laboratory Equipment Booking System

C++ OOP project: book lab gear via a text menu. No database.

## Build

```
g++ -std=c++17 -Wall main.cpp -o labbook
./labbook
```

## Presentation

`presentation.pdf` is the 8 slide deck for the IA3 demo. Source is in `slides/deck.html`. Rebuild with:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --no-pdf-header-footer \
  --print-to-pdf=slides/deck.pdf slides/deck.html
```

## Files

* `Equipment.h` - Equipment base plus Microscope, Centrifuge, Spectrometer
* `User.h` - User base plus Student (year 1-3), Faculty, LabAdmin
* `Booking.h` - one borrow record
* `BookingSystem.h` - owns all lists, borrow and return rules
* `Types.h` - shared Result and GearSpec structs
* `main.cpp` - menu loop
