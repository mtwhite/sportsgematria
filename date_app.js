const startInput = $("#startDate-input");
const endInput = $("#endDate-input");
const includeEndDate = $("#includeEndDate");

const dateLocaleOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
}
const formObject = {
    startDate : moment('1901-01-01'),
    endDate : moment(),
};

function getAllDigs(num){
    return [...String(num)].map(e => parseInt(e));
}

function updateNumerologies(){
    $("#startNumerology").html(getNumerology(formObject.startDate.format('YYYY-M-D'), formObject.startDate));
    $("#endNumerology").html(getNumerology(formObject.endDate.format('YYYY-M-D'), formObject.endDate));
}

function getNumerology(date, moment){
    date = date.split('-').map(e => parseInt(e));

    /* 
        Date Indexes
            0 - Year
            1 - Month
            2 - Day
    */

    return `<tr>
        ${cellulizerAdd(date[1], date[2], Math.floor(date[0]/100), date[0] % 100)}
    </tr><tr>
        ${cellulizerAdd(date[1], date[2], ...getAllDigs(date[0]))}
    </tr><tr>
        ${cellulizerAdd(date[1], ...getAllDigs(date[2]), ...getAllDigs(date[0]))}
    </tr><tr>
        ${cellulizerAdd(date[1], date[2], date[0] % 100)}
    </tr><tr>
        ${cellulizerAdd(date[1], ...getAllDigs(date[2]), ...getAllDigs(date[0] % 100))}
    </tr><tr>
        <td>Day of Year: (${moment.format("MMM-DD")})</td>
        <td>${moment.dayOfYear()}</td>
    </tr><tr>
        <td>Days Left in Year: (${moment.format("MMM-DD")})</td>
        <td>${366 - moment.dayOfYear() - (moment.isLeapYear() ? 0 : 1)}</td>
    </tr><tr>
        ${cellulizerAdd(date[1], date[2])}
    </tr><tr>
        ${cellulizerAdd(...getAllDigs(date[1]), ...getAllDigs(date[2]), Math.floor(date[0]/100), date[0] % 100)}
    </tr><tr>
        ${cellulizerAdd(date[1], date[2], Math.floor((date[0] % 100) / 10), date[0] % 10)}
    </tr><tr>
        ${cellulizerAdd(...getAllDigs(date[1]), ...getAllDigs(date[2]), date[0] % 100)}
    </tr><tr>
        ${cellulizerMul(...getAllDigs(date[1]), ...getAllDigs(date[2]), ...getAllDigs(date[0]) )}
    </tr><tr>
        ${cellulizerMul(...getAllDigs(date[1]), ...getAllDigs(date[2]), ...getAllDigs(date[0] % 100) )}
    </tr>`;
}

function cellulizerAdd(...arr){
    let total = arr.reduce( (e, i) => e + i);
    return `<td>${arr.map(e => `(${e})`).join(" + ")}</td><td class="h6">${total}</td>`
}

function cellulizerMul(...arr){
    arr = arr.filter(e => e != 0);
    let total = arr.reduce( (e, i) => {
        if(e == 0 || i == 0) return e;
        return e * i;
    });
    return `<td>${arr.map(e => `(${e})`).join(" × ")}</td><td class="h6">${total}</td>`
}

Object.defineProperty(formObject, "start", {
    get (){
        return this.startDate || $(startInput).value;
    },
    set (val){
        if(val.length == 0 || !val) val = '1901-01-01';
        this.startDate = moment(val);
        $(`.startTimeResult`).text(this.startDate.format('ddd MMM D YYYY'));
        try {
            this.diff = this.endDate.diff(this.startDate, 'days');
        }catch(e){
            console.error(e);
        }
    }
});

Object.defineProperty(formObject, "end", {
    get () {
        return this.endDate || $(endInput).value;
    },
    set (val){
        if(val.length == 0 || !val) val = '1901-01-01';
        this.endDate = moment(val);
        $(`.endTimeResult`).text(this.endDate.format('ddd MMM D YYYY'));
        try{
            this.diff = this.endDate.diff(this.startDate, 'days');
        }catch(e){
            console.error(e);
        }
    }
})

Object.defineProperty(formObject, "resultRelative", {
    set(val){
        this.resultStr = '';
        this.resultAbsolute = val;
        const result = {};
        const resultTypes = $("[name='resultType']");

        if($($(resultTypes)[0]).is(":checked")){
            result.year = Math.floor(val / 365);
            val = val - (result.year * 365);
        }

        if($($(resultTypes)[1]).is(":checked")){
            result.month = Math.floor(val / 30);
            val = val - (result.month * 30);
        }

        if($($(resultTypes)[2]).is(":checked")){
            result.week = Math.floor(val / 7);
            val = val - (result.week * 7);
        }

        if($($(resultTypes)[3]).is(":checked")){
            result.day = val;
        }

        for(let i in result){
            this.resultStr += `<span class="text-primary">${result[i]}</span> ${i}s</br>`;
        }

        $("#resultRelativeCont").html(this.resultStr);
    }
})

Object.defineProperty(formObject, "resultAbsolute", {
    set(val){
        const result = {
            year: 365,
            month: 30,
            week: 7,
            day: 1
        };

        this.resultAbs = '';

        for(let i in result){
            const absolute = Math.floor(val / result[i]);
            const r = val - (absolute * result[i]);

            this.resultAbs += `<span class="text-primary">${absolute}</span> ${i}s ${(r) ? `, ${r} days` : ""}<br>`;
        }

        $("#resultAbsoluteCont").html(this.resultAbs);

        updateNumerologies();
    }
})

Object.defineProperty(formObject, "diff", {
    get (){
        formObject.resultRelative = this.timeBetween;
        this.diff = this.endDate.diff(this.startDate, 'days');
    },
    set(val){
        val = Math.abs(val);
        if($(includeEndDate).is(":checked")) val++;
        this.timeBetween = val; 
        formObject.resultRelative = this.timeBetween;
    }
})

$(startInput).on("input", (e) => {
    formObject.start = e.target.value;
})

$(endInput).on("input", (e) => {
    formObject.end = e.target.value;
})

$(includeEndDate).on("change", (e) => {
    if(!$(e.target).is(":checked")) formObject.timeBetween--;
    formObject.diff = formObject.timeBetween;
})

$('[name="resultType"').on("change", (e) => {
    if($(includeEndDate).is(":checked")) formObject.timeBetween--;
    formObject.diff = formObject.timeBetween;
})

$(document).ready(() => {
    formObject.end = moment().format("YYYY-M-D");
    formObject.start = moment().subtract({years: 1}).format("YYYY-M-D");
    updateNumerologies();
})