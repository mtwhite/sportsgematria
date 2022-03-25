var map = {};

const ci_initials = `EO FR SR FRKV SRKV EEX FB FBS SN
rO rFR rSR rFREP rSREP rEX rFB rFBS rSN
JR JO JE
ALWK KFWK LCHK
ES rES PR TR SQ rPR rTR rSQ
SE CH KP FI`;

sessionStorage.setItem("savedStr", JSON.stringify([]));

var sessionData = sessionStorage.getItem("savedStr");

const form = {
    input: '',
    mainType: 'EO',
    tempType: 'EO',
    active: ['EO', 'FR', 'rO', 'rFR'],
    inActive: [],
    results: [],
    options : {
        showWordCount: true,
        showReduction: true,
        simpleResult: true,
        ciphNames: true,
        ciphChart: true,
    }
};

form.inActive = ci_initials.split(/\s/g).filter(e => !form.active.includes(e));

Object.defineProperty(form, "text", {
    set(val) {
        this.input = val;
        genResults();
    },
    get() {
        return this.input;
    }
})

function genResults(){
    Cipher.processInput();
    genTable();
    displaySavedResults();
}

function tempChange(target){
    form.tempType = target.dataset.ini;

    genCharBreaks();
}

function backToMain(){
    form.tempType = form.mainType;
    
    genCharBreaks();
}

function mainChange(target){
    form.mainType = target.dataset.ini;

    genResults();
}

function genTable(){
    $("#GemetriaTable").html('');

    let resTable = '<table class="table table-borderless">';
    let calcColumns = 6, col = 0;

    if(form.active.length % 3 == 0) calcColumns = 3;
    if(form.active.length % 4 == 0) calcColumns = 4;
    if(form.active.length % 5 == 0) calcColumns = 5;

    let calcRows = Math.ceil(form.active.length / calcColumns);

    for(let i = 0; i < calcRows; i++){

        resTable += `<tr>`;

        // Planning on separating sections
        for(let j = 0; j < calcColumns; j++){
            let rIndex = (i * calcColumns) + j;

            if(rIndex >= form.active.length) continue;

            let r = form.results[rIndex];

            resTable += `<td class="${(r.ini == form.mainType) ? "mainCiph" : ""} cursor-pointer text-center ciphs" onmouseover="tempChange(this)" onmouseout="backToMain(this)" onclick="mainChange(this)" data-ini="${r.ini}"><span class="ciphName ${(form.options.ciphNames ? "" : "sr-only")}"  >${r.type}</span><br><strong class="h2">${r.total}</strong><br>${(r.reduce ? `<strong class="res-Reductions ${(form.options.showReduction) ? "" : "sr-only"}">${r.reduce}</strong>` : "")}</td>`
        }

        resTable += `</tr>`;


    }

    resTable += '</table>'

    $("#GemetriaTable").html(resTable);
    if(form.strDetails.charCount){
        $("#stringDetails").show();
        $("#CharBreakpoint").show();
        genCharBreaks();
    }else {
        $("#stringDetails").hide();
        $("#CharBreakpoint").hide();
    }
}

function genCharBreaks(){
    const tarResult = form.results.find(e => e.ini == form.tempType);

    const grandTotalClasses = `grandTotal bg-dark text-light`,
          totalClasses = `font-weight-bold border-right border-left border-dark`,
          chClasses = ``,
          scClasses = `small`,
          tableClasses = `mt-1 border-left border-top border-bottom border-dark`;

    // String Details
    $("#strGeneral").html(`(${form.strDetails.charCount} letters, ${form.strDetails.wordCount} words)`);
    $("#strSpecific").html(`<div class="h5">"${form.input}" = <strong>${tarResult.total}</strong> <span style="color:${Cipher[tarResult.ini].color}">(${tarResult.type})</span> </div>`);

    // Table
    const maxTableCol = 35; // characters
    let tableCols = [], tempTotal = 0, wordCount = 0;
    for(let i = 0; i < tarResult.words.length; i++){
        tempTotal += tarResult.words[i].word.length + 1;
        wordCount++;

        if(tempTotal >= maxTableCol){
            tempTotal = tarResult.words[i].word.length + 1;
            tableCols.push(wordCount - 1);
            wordCount = 1;
        }
    }

    tableCols.push(wordCount);

    let breakHtml = '';

    for(let i = 0; i < tableCols.length; i++){
        breakHtml += `<table class="${tableClasses}"><tr>`;

        let wordIndex = 0;

        for(let index = 1; index < i; index++){
            wordIndex += tableCols[index - 1];
        }
        
        for(let j = 0; j < tableCols[i]; j++){
            let wordIndex = 0;
    

            for(let index = 1; index < (i + 1); index++){
                wordIndex += tableCols[index - 1];
            }
            
            wordIndex += j;

            for(let char = 0; char < tarResult.words[wordIndex].word.length; char++){
                breakHtml += `<td class="${chClasses}">${tarResult.words[wordIndex].word[char]}</td>`;

                if(char == (tarResult.words[wordIndex].word.length) - 1){
                    breakHtml += `<td rowspan="2" class="${totalClasses}"><div class="d-flex align-items-center">${tarResult.words[wordIndex].total}</div></td>`
                }
            }

        }

        if(i == tableCols.length - 1){
            breakHtml += `<td class="${grandTotalClasses}" rowspan="2">${tarResult.total}</td>`;
        }
        breakHtml += '</tr><tr>'; 

        for(let j = 0; j < tableCols[i]; j++){
            let wordIndex = 0;
    

            for(let index = 1; index < (i + 1); index++){
                wordIndex += tableCols[index - 1];
            }
            
            wordIndex += j;

            for(let char = 0; char < tarResult.words[wordIndex].word.length; char++){
                breakHtml += `<td class="${scClasses}">${tarResult.words[wordIndex].scores[char]}</td>`;
            }

        }

        breakHtml += `</tr></table>`;
    }

    $("#CharBreakpoint").html(breakHtml);
    genCiphGuide();
}

const isUpperCase = (string) => /^[A-Z]*$/.test(string);

function moveUp(target){
    const tarIni = target.parentElement.parentElement.dataset.ini;
    const inIndex = form.active.indexOf(tarIni);

    if(inIndex == 0) return;

    [form.active[inIndex], form.active[inIndex - 1]] = [form.active[inIndex - 1], form.active[inIndex]];

    genResults();
}

function moveDown(target){
    const tarIni = target.parentElement.parentElement.dataset.ini;
    const inIndex = form.active.indexOf(tarIni);

    if(inIndex == form.active.length - 1) return;

    [form.active[inIndex], form.active[inIndex + 1]] = [form.active[inIndex + 1], form.active[inIndex]];

    genResults();
}

function genCiphGuide(){
    const buttonClasses = `btn btn-secondary`;

    const targetCiph = Cipher[form.tempType];
    let ciphStr = '<div class="col-2"  ><button onclick="moveUp(this)" class="' + buttonClasses +'">Move Up</button></div><div class="col-8 text-center h5">' + targetCiph.name + '</div><div class="col-2"><button onclick="moveDown(this)" class="' + buttonClasses +'">Move Down</button></div>';

    ciphStr += `<table class="table mt-2 table-sm table-borderless"><tr>`;

    for(let i of targetCiph.map){
        if(isUpperCase(i[0])) continue;
        
        ciphStr += `<td class="text-center border border-dark"><span class="font-weight-bold">${i[0]}</span><br>${i[1]}</td>`;
    }

    switch(form.tempType){
        case 'FB':
        case 'rFB':
        case 'FBS':
        case 'rFBS':
            ciphStr += `</tr><tr>`

            for(let i of targetCiph.map){
                if(!isUpperCase(i[0])) continue;
                
                ciphStr += `<td class="text-center border border-dark"><span class="font-weight-bold">${i[0]}</span><br>${i[1]}</td>`;
            }

            break;
    }

    ciphStr += `</tr></table>`;

    $("#ciphGuide").html(ciphStr);
    $("#ciphGuide").attr('data-ini', form.tempType);
}


class Cipher {
    static ctg = new Set();

    constructor(obj) {
        this.name = obj.name;
        this.category = obj.category;
        this.color = obj.color || "white";
        this.initial = obj.initial;

        this.map = map[this.initial];
        this.keys = [];
        this.amp = obj.amp || false;

        Cipher.ctg.add(this.category);
        Cipher[obj.initial] = this;
    }
    getScore(text, scoreOnly = false) {
        const collection = (this.amp) ? text.match(/[A-Za-z0-9&]+/g) : text.match(/[A-Za-z0-9]+/g);
        if (!collection && !scoreOnly) {

            form.strDetails = {
                charCount: 0,
                wordCount: 0
            }

            return {
                words: [],
                total: 0,
                charCount: 0,
                wordCount: 0,
                type: this.name,
                reduce: 0,
                ini: this.initial,
            };
        }
        let colResult = [],
            grandTotal = 0,
            letterCount = text.match(/[A-Za-z]/g).length;

        for (let i of collection) {
            let wordScores = [],
                total = 0;

            for (let j = 0; j < i.length; j++) {
                if(!isNaN(i[j])){
                    wordScores.push(parseInt(i[j]));
                    total += parseInt(i[j]);
                    continue;
                }

                let charScore = this.map.get(i[j]);

                wordScores.push(charScore);
                total += charScore;
            }

            colResult.push({
                word: i,
                scores: wordScores,
                total: total
            });

            grandTotal += total;
        }

        if(scoreOnly){
            return {
                score: grandTotal,
                type: this.name
            }
        }

        form.strDetails = {
            charCount: letterCount,
            wordCount: colResult.length
        }

        return {
            words: colResult,
            total: grandTotal,
            type: this.name,
            reduce: Cipher.reduce(grandTotal),
            ini: this.initial,
        }
    }
    static reduce(num) {
        let total = 0,
            s;

        while (num > 9) {
            if (num == 11 || num == 22 || num == 33) {
                return num;
            }

            total = 0;
            for (let i = 0; i < String(num).length; i++) {
                s = Number(String(num).slice(i, i + 1));
                total += s;
            }
            num = total;
        }

        return num;
    }
    static processInput(){
        form.results = [];

        for(let i of form.active){
            form.results.push(Cipher[i].getScore(form.input));
        }
    }
    static getCiphersFromCategory(category){
        let res = [];

        // Returns initials only
        for(let i in Cipher){
            if(Cipher[i].category == category){
                res.push(Cipher[i].initial);
            }
        }

        return res;
    }
}

ci_initials.split(/[\s]/).forEach((e) => map[e] = new Map());

// MAPPINGS
{

    let tmpI = 0,
        tmp = ci_initials.split(/\s/g)[tmpI];

    // ---- English ------

    // English Ordinal Mapping
    for (let i = 0; i < 26; i++) {
        // Small Letters
        map[tmp].set(String.fromCharCode(97 + i), i + 1);

        // Big Letters
        map[tmp].set(String.fromCharCode(65 + i), i + 1);
    }

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Full Reduction Mapping
    for (let i = 0; i < 26; i++) {
        // Small Letters
        map[tmp].set(String.fromCharCode(97 + i), (i % 9) + 1);

        // Big Letters
        map[tmp].set(String.fromCharCode(65 + i), (i % 9) + 1);
    }

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Single Reduction Mapping
    for (let i = 0; i < 26; i++) {

        let indexStr = (i % 9) + 1;
        if (i == 18) indexStr = 10;

        // Small Letters
        map[tmp].set(String.fromCharCode(97 + i), parseInt(indexStr));

        // Big Letters
        map[tmp].set(String.fromCharCode(65 + i), parseInt(indexStr));
    }


    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Full Reduction KV
    for (let i = 0; i < 26; i++) {
        let indexStr = String(i + 1);

        if (indexStr[0] != indexStr[1]) indexStr = (i % 9) + 1;

        // Small Letters
        map[tmp].set(String.fromCharCode(97 + i), parseInt(indexStr));

        // Big Letters
        map[tmp].set(String.fromCharCode(65 + i), parseInt(indexStr));
    }

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Single Reduction KV

    for (let i = 0; i < 26; i++) {
        let indexStr = String(i + 1);

        if (indexStr[0] != indexStr[1]) {
            indexStr = (i % 9) + 1;
            if (i == 18) {
                indexStr = 10;
            }
        }

        // Small Letters
        map[tmp].set(String.fromCharCode(97 + i), parseInt(indexStr));

        // Big Letters
        map[tmp].set(String.fromCharCode(65 + i), parseInt(indexStr));
    }

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // English Extended

    for (let i = 0; i < 26; i++) {
        let val = ((i % 9) + 1) * (10 ** Math.floor((i + 1) / 10));
        if (i == 18) val = 100;

        // Small Letters
        map[tmp].set(String.fromCharCode(97 + i), val);

        // Big Letters
        map[tmp].set(String.fromCharCode(65 + i), val);
    }

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Francis Bacon
    for (let i = 0; i < 26; i++) {
        // Small Letters
        map[tmp].set(String.fromCharCode(97 + i), i + 1);
        // Big Letters
        map[tmp].set(String.fromCharCode(65 + i), i + 27);
    }

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Franc Baconis
    for (let i = 0; i < 26; i++) {
        // Small Letters
        map[tmp].set(String.fromCharCode(97 + i), (i + 1) * 2);
        // Big Letters
        map[tmp].set(String.fromCharCode(65 + i), ((i + 1) * 2) - 1);
    }

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Satanic
    for (let i = 0; i < 26; i++) {
        // Small Letters
        map[tmp].set(String.fromCharCode(97 + i), i + 36);
        // Big Letters
        map[tmp].set(String.fromCharCode(65 + i), i + 36);
    }

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // ---- Reverses ------
    for (let i = 0; i < 9; i++) {
        let oI = ci_initials.split(/\n/)[0].split(' ')[i],
            rI = ci_initials.split(/\n/)[1].split(' ')[i];

        // console.log(oI, rI);

        for (let j = 0; j < 26; j++) {
            let smChR = String.fromCharCode(97 + (25 - j)),
                lgChR = String.fromCharCode(65 + (25 - j)),
                smCh = String.fromCharCode(97 + j),
                lgCh = String.fromCharCode(65 + j);

            map[rI].set(smCh, map[oI].get(smChR));
            map[rI].set(lgCh, map[oI].get(lgChR));
        }

        tmpI++;
    }

    // ---- JEWISH ------

    tmp = ci_initials.split(/\s/g)[tmpI];

    // Jewish Reduction

    let adj = 0;

    for (let i = 0; i < 23; i++) {
        switch (i) {
            case 20:
                adj++;
            case 9:
                adj++;
                break;
        }
        map[tmp].set(String.fromCharCode(97 + (i + adj)), (i % 9) + 1);
        map[tmp].set(String.fromCharCode(65 + (i + adj)), (i % 9) + 1);
    }

    map[tmp].set('j', 6);
    map[tmp].set('J', 6);
    map[tmp].set('v', 7);
    map[tmp].set('V', 7);
    map[tmp].set('&', 8);
    map[tmp].set('w', 9);
    map[tmp].set('W', 9);

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Jewish Ordinal
    adj = 0;

    for (let i = 0; i < 23; i++) {
        switch (i) {
            case 20:
                adj++;
            case 9:
                adj++;
                break;
        }

        map[tmp].set(String.fromCharCode(97 + (i + adj)), i + 1);
        map[tmp].set(String.fromCharCode(65 + (i + adj)), i + 1);
    }

    map[tmp].set('j', 24);
    map[tmp].set('J', 24);
    map[tmp].set('v', 25);
    map[tmp].set('V', 25);
    map[tmp].set('&', 26);
    map[tmp].set('W', 27);
    map[tmp].set('w', 27);

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Jewish
    adj = 0;

    for (let i = 0; i < 23; i++) {
        let val = ((i % 9) + 1) * (10 ** Math.floor((i + 1) / 10));
        if (i == 18) val = 100;

        switch (i) {
            case 20:
                adj++;
            case 9:
                adj++;
                break;
        }

        map[tmp].set(String.fromCharCode(97 + (i + adj)), val);
        map[tmp].set(String.fromCharCode(65 + (i + adj)), val);
    }

    map[tmp].set('j', 600);
    map[tmp].set('J', 600);
    map[tmp].set('v', 700);
    map[tmp].set('V', 700);
    map[tmp].set('&', 800);
    map[tmp].set('W', 900);
    map[tmp].set('w', 900);

    // ---- KABBALAH ------

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // ALW Kabbalah

    for (let i = 0; i < 26; i++) {
        let ch = ((11 * (i)) % 26);

        map[tmp].set(String.fromCharCode(97 + ch), i + 1);
        map[tmp].set(String.fromCharCode(65 + ch), i + 1);
    }

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // KFW Kabbalah

    [107, 102, 119, 114, 109, 100, 121, 116, 97, 118, 113, 104, 99, 120, 111, 106, 101, 108, 103, 98, 115, 110, 105, 122, 117, 112].forEach((e, i) => {
        map[tmp].set(String.fromCharCode(e), i + 1);
        map[tmp].set(String.fromCharCode(e - 32), i + 1);
    })

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // LCH Kabbalah

    [105, 108, 99, 104, 112, 97, 120, 106, 119, 116, 111, 103, 102, 101, 114, 115, 113, 107, 121, 122, 98, 109, 118, 100, 110, 117].forEach((e, i) => {
        map[tmp].set(String.fromCharCode(e), i);
        map[tmp].set(String.fromCharCode(e - 32), i);
    })

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // ---- Mathematical ------

    // English Sumerian and Reverse

    for (let i = 0; i < 26; i++) {
        map[tmp].set(String.fromCharCode(97 + i), (i + 1) * 6);
        map[tmp].set(String.fromCharCode(65 + i), (i + 1) * 6);

        let tmpR = ci_initials.split(/\s/g)[tmpI + 1];

        map[tmpR].set(String.fromCharCode(97 + (25 - i)), (i + 1) * 6);
        map[tmpR].set(String.fromCharCode(65 + (25 - i)), (i + 1) * 6);
    }

    tmpI += 2;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Primes

    [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101].forEach((e, i) => {
        map[tmp].set(String.fromCharCode(97 + i), e);
        map[tmp].set(String.fromCharCode(65 + i), e);
    })

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Trigonal
    let adj2 = 1;
    adj = 1;

    for (let i = 0; i < 26; i++) {
        map[tmp].set(String.fromCharCode(97 + i), adj);
        map[tmp].set(String.fromCharCode(65 + i), adj);
        adj2++;
        adj += adj2;
    }

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Squares

    for (let i = 0; i < 26; i++) {
        map[tmp].set(String.fromCharCode(97 + i), (i + 1) ** 2);
        map[tmp].set(String.fromCharCode(65 + i), (i + 1) ** 2);
    }

    tmpI++;

    // Mathematical Reverse (Prime, Trigonal, & Square)

    for (let i = 2; i < 5; i++) {
        tmp = ci_initials.split(/\s/g)[tmpI];
        let target = map[ci_initials.split(/\s/g)[tmpI - 3]];

        for (let j = 0; j < 26; j++) {
            map[tmp].set(String.fromCharCode(97 + j), target.get(String.fromCharCode(97 + (25 - j))));
            map[tmp].set(String.fromCharCode(65 + j), target.get(String.fromCharCode(65 + (25 - j))));
        }

        tmpI++;
    }

    tmp = ci_initials.split(/\s/g)[tmpI];

    // ---- Other ------

    // Septenary

    adj = 0, adj2 = 0;

    for (let i = 0; i < 26; i++) {
        if (adj) adj2--;
        else adj2++;

        if (adj2 == 0) {
            adj2 = 1;
            adj = 0;
        } else if (adj2 == 8) {
            adj2 = 6;
            adj = 1;
        }

        map[tmp].set(String.fromCharCode(97 + i), adj2);
        map[tmp].set(String.fromCharCode(65 + i), adj2);
    }

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Chaldean

    [1, 2, 3, 4, 5, 8, 3, 5, 1, 1, 2, 3, 4, 5, 7, 8, 1, 2, 3, 4, 6, 6, 6, 5, 1, 7].forEach((e, i) => {
        map[tmp].set(String.fromCharCode(97 + i), e);
        map[tmp].set(String.fromCharCode(65 + i), e);
    })

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Keypad

    [2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9].forEach((e, i) => {
        map[tmp].set(String.fromCharCode(97 + i), e);
        map[tmp].set(String.fromCharCode(65 + i), e);
    })

    tmpI++;
    tmp = ci_initials.split(/\s/g)[tmpI];

    // Fibonacci    

    [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 233, 144, 89, 55, 34, 21, 13, 8, 5, 3, 2, 1, 1].forEach((e, i) => {
        map[tmp].set(String.fromCharCode(97 + i), e);
        map[tmp].set(String.fromCharCode(65 + i), e);
    })


}

// Creates all Ciphers
{
    // ENGLISH CATEGORY
    `English Ordinal
Full Reduction
Single Reduction
Full Reduction KV
Single Reduction KV
English Extended
Francis Bacon
Franc Baconis
Satanic`.split(/\n/g).forEach((e, i) => {
        const ini_Group = ci_initials.split(/\n/g)[0].split(" ");

        new Cipher({
            name: e,
            initial: ini_Group[i],
            color: "green",
            category: "English"
        })
    });


    // REVERSE CATEGORY
    `Reverse Ordinal
Reverse Full Reduction
Reverse Single Reduction
Reverse Full Reduction EP
Reverse Single Reduction EP
Reverse Extended
Reverse Francis Bacon
Reverse Franc Baconis
Reverse Satanic`.split(/\n/g).forEach((e, i) => {
        const ini_Group = ci_initials.split(/\n/g)[1].split(" ");

        new Cipher({
            name: e,
            initial: ini_Group[i],
            color: "green",
            category: "Reverse"
        })
    });

    // JEWISH CATEGORY
    `Jewish Reduction
Jewish Ordinal
Jewish`.split(/\n/g).forEach((e, i) => {
        const ini_Group = ci_initials.split(/\n/g)[2].split(" ");

        new Cipher({
            name: e,
            initial: ini_Group[i],
            color: "purple",
            category: "Jewish",
            amp: true
        })
    });

    // KABBALAH CATEGORY
    `ALW Kabbalah
KFW Kabbalah
LCH Kabbalah`.split(/\n/g).forEach((e, i) => {
        const ini_Group = ci_initials.split(/\n/g)[3].split(" ");

        new Cipher({
            name: e,
            initial: ini_Group[i],
            color: "red",
            category: "Kabbalah"
        })
    });

    // MATHEMATICAL CATEGORY
    `English Sumerian
Reverse English Sumerian
Primes
Trigonal
Squares
Reverse Primes
Reverse Trigonal
Reverse Squares`.split(/\n/g).forEach((e, i) => {
        const ini_Group = ci_initials.split(/\n/g)[4].split(" ");

        new Cipher({
            name: e,
            initial: ini_Group[i],
            color: "darkyellow",
            category: "Mathematical"
        })
    });

    // OTHER CATEGORY
    `Septenary
Chaldean
Keypad
Fibonacci`.split(/\n/g).forEach((e, i) => {
        const ini_Group = ci_initials.split(/\n/g)[5].split(" ");

        new Cipher({
            name: e,
            initial: ini_Group[i],
            color: "orange",
            category: "Other"
        })
    });
}

$("#textInput").on("input", function(){
    form.text = $(this).val();
})

$("#textInput").on("change", function(){
    if(!$(this).val()) return;

    sessionData = JSON.parse(sessionStorage.getItem("savedStr"));
    console.log(sessionData);
    sessionData.push($(this).val());
    sessionStorage.setItem("savedStr", JSON.stringify(sessionData));

    displaySavedResults();
})

function displaySavedResults(){
    if(sessionData.length == 0 || typeof sessionData == "string") return;

    let tr = `<tr><th scope="col">Text</th>`;

    for(let i of form.active){
        tr += `<th scope="col">${Cipher[i].name}</th>`;
    }

    $("#historyHeader").html(tr);

    tr = ``;

    for(let i of sessionData){
        tr += `<tr><td>${i}</td>`;

        for(let ciph of form.active){
            const score = Cipher[ciph].getScore(i);
            tr += `<td>${score.total}</td>`;
        }

        tr += `</tr>`;

        $("#savedStrings").html(tr);
    }

}

function changeStates(chkbox){
    const ini = $(chkbox).attr("data-ini");

    if($(chkbox).is(":checked")){
        console.log(`${ini} Cipher is Enabled!`);
        if(!form.active.includes(ini)){
            form.active.push(ini);

            form.inActive = ci_initials.split(/\s/g).filter( e => !(form.active.includes(e)));
        }
    }else{
        console.log(`${ini} Cipher is Disabled!`);
        if(form.active.includes(ini)){
            form.active.splice(form.active.indexOf(ini), 1);
        }
    }

    genResults();
}

function toggleAll(){
    form.active = ci_initials.split(/\s/g);
    form.inActive = [];

    renderCiphInputs();
    genResults();
}

function toggleBase(){
    form.active = ['EO', 'FR', 'rO', 'rFR'];
    form.inActive = ci_initials.split(/\s/g).filter(e => !form.active.includes(e));

    renderCiphInputs();
    genResults();
}

function renderCiphInputs(){
    for(let i of form.active){
        document.getElementById(`ciphControl-${i}`).checked = true;
    }
    for(let i of form.inActive){
        document.getElementById(`ciphControl-${i}`).checked = false;
    }
}

function renderOptions(){
    // Show Letter/Word Count
    if(form.options.showWordCount) $("#strGeneral").show();
    else $("#strGeneral").hide();

    // Show Reductions
    if(form.options.showReduction) $(".res-Reductions").removeClass("sr-only");
    else $(".res-Reductions").addClass("sr-only");

    // Show Simple Result
    if(form.options.simpleResult) $("#strSpecific").show();
    else $("#strSpecific").hide();


    // Show Cipher Names
    if(form.options.ciphNames) $(".ciphName").removeClass("sr-only");
    else $(".ciphName").addClass("sr-only");

    // Show Cipher Chart
    if(form.options.ciphChart) $("#ciphGuide").show();
    else $("#ciphGuide").hide();

}

$(document).ready(function () {

    $("#option-showCount").on("change", function(e){
        form.options.showWordCount = $(this).is(":checked");

        renderOptions();
    })

    $("#option-showReduct").on("change", function(e){
        form.options.showReduction = $(this).is(":checked");

        renderOptions();
    })

    $("#option-showResult").on("change", function(e){
        form.options.simpleResult = $(this).is(":checked");

        renderOptions();
    })

    $("#option-showCiph").on("change", function(e){
        form.options.ciphNames = $(this).is(":checked");

        renderOptions();
    })

    $("#option-showCiphChart").on("change", function(e){
        form.options.ciphChart = $(this).is(":checked");

        renderOptions();
    })

    // Assign cipher categories in the cipher modal

    let tempHtml = '', tempHtml2 = '', count = 0;

    for(let i of Cipher.ctg){
        tempHtml += `<a class="w-100 nav-link ${count ? "" : "active"}" id="nav-${i}-tab" data-toggle="tab" href="#ciph-${i}-cont" type="button" role="tab" aria-controls="ciph-${i}-cont" aria-selected="${count ? "false" : "true"}">${i}</a>`;

        const iniList = Cipher.getCiphersFromCategory(i);

        tempHtml2 += `<div class="tab-pane fade ${count ? "" : "show active"} p-3" id="ciph-${i}-cont" role="tabpanel" aria-labelledby="nav-${i}-tab">
            ${
                iniList.map(e => `<div class="custom-control custom-checkbox">
                <input type="checkbox" onchange="changeStates(this)" data-ini="${e}" class="custom-control-input ciphControls" id="ciphControl-${e}">
                <label for="ciphControl-${e}" class="custom-control-label">${Cipher[e].name}</label>
            </div>`).join("")
            }
        </div>`
        count++;
    }

    $("#cipher-category").html(tempHtml);
    $("#cipher-content").html(tempHtml2);

    renderCiphInputs();


})