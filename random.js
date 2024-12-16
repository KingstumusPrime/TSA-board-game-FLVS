let PSR_previous1023, n01240 = 0; // give the most random names to i dont overwrite

function lcgToFloat(lcgValue, maxValue, minValue = 0) {
    let s =  '0' + (((maxValue - minValue))/lcgValue).toString().slice(1);
    return parseFloat(s);
}


class pseudoRandom{
    constructor(seed){
        PSR_previous1023 = seed;
        n01240 = 0;
    }


    next(){
        n01240 = PSR_previous1023 * 16807 % 2147483647;
        PSR_previous1023 = n01240;
        return lcgToFloat(n01240, 1);
    }
}