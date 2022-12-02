pragma circom 2.0.0;
include "../node_modules/circomlib/circuits/comparators.circom";

template CountryRestriction() {
    // public: 5 countries' 3-lettered ISO names.
    signal input countries[5]; 
    
    // private
    signal input country;

    // true/false
    signal output out;

    component isEqual[5];
    var sanctioned = 0;

    for(var i = 0; i < 5; i++){
        isEqual[i] = IsEqual(); 
        isEqual[i].in[0] <== country;
        isEqual[i].in[1] <== countries[i];

        if (isEqual[i].out == 1) {
            sanctioned++;
        }
    }

    out <-- sanctioned == 0 ? 1 : 0;
    out === 1;
}

component main = CountryRestriction();