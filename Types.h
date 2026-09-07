#pragma once
// Shared structs used across classes.
// Kept as struct (open fields) since these are plain data holders.
#include <string>

// Verbose result for every action: success flag plus full message.
struct Result {
    bool ok;            // true = action worked
    std::string msg;    // full sentence for screen
};

// Spec bundle for creating gear: lets admin pass one pack.
struct GearSpec {
    std::string kind;   // "microscope", "centrifuge", "spectrometer"
    std::string name;   // model name
    std::string brand;  // maker name
    int value;          // mag / rpm / nm based on kind
};
