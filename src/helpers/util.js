//===============================
// String & Number manipulation
//===============================
export const numberFormatter = (number, fixed = 2) => {
    // Nine Zeroes for Billions
    return Math.abs(Number(number)) >= 1.0e9
        ? (Math.abs(Number(number)) / 1.0e9).toFixed(fixed) + 'B'
        : // Six Zeroes for Millions
          Math.abs(Number(number)) >= 1.0e6
          ? (Math.abs(Number(number)) / 1.0e6).toFixed(fixed) + 'M'
          : // Three Zeroes for Thousands
            Math.abs(Number(number)) >= 1.0e3
            ? (Math.abs(Number(number)) / 1.0e3).toFixed(fixed) + 'K'
            : Math.abs(Number(number)).toFixed(fixed);
};

export const capitalize = (str) =>
    (str.charAt(0).toUpperCase() + str.slice(1)).replace(/-/g, ' ');

export const camelize = (str) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
};

export const dashed = (str) => {
    return str.toLowerCase().replaceAll(' ', '-');
};

export const slugifyText = (str) =>
    str
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

export const isIterableArray = (array) =>
    Array.isArray(array) && !!array.length;

// get file size
export const getSize = (size) => {
    if (size < 1024) {
        return `${size} Byte`;
    } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    } else {
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
};

//===============================
// Other
//===============================
export function mergeObjects(obj1, obj2) {
    let mergedObject = {};
    for (const key in obj1) {
        if (mergedObject[key] === undefined || mergedObject[key] === null)
            mergedObject[key] = obj1[key];
    }
    for (const key in obj2) {
        if (mergedObject[key] === undefined || mergedObject[key] === null)
            mergedObject[key] = obj2[key];
    }
    return mergedObject;
}

export function debounceEffect(effect, debounceMs) {
    let timer;
    return (arg, r) => {
        clearTimeout(timer);
        timer = setTimeout(() => effect(arg, r), debounceMs);
    };
}

export function readableFileSize(size) {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (
        (size / Math.pow(1024, i)).toFixed(2) * 1 +
        ' ' +
        ['B', 'kB', 'MB', 'GB', 'TB'][i]
    );
}

export function arrayEquals(a, b) {
    return (
        Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index])
    );
}

// Return the date with depend of Local Time Zone
Date.prototype.formattedDate = function () {
    return this.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
    });
};
