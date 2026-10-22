# Shared Laboratory Equipment Booking System

C++ OOP project: book lab gear via a text menu. No database.

## Live

* Slides and terminal: https://lab-booking-system-mu.vercel.app
* Terminal only: https://lab-booking-system-mu.vercel.app/#shell
* The site source is in `web/`. It is a static export of the deck plus a browser port of the same menu and rules.
* The terminal takes clickable suggestions, and the guided flow walks every feature: login, borrow, refusal, a second user, quota, search, late fine, admin add and remove.

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
