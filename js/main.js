/**
 * Launch the canvas. Hide headphone warning.
 */

const soundsOfSmashKV = {};

function start() {
    $('#headphone-warning').addClass('hidden');
    $('#filter-bar').removeClass('hidden');
    $.getJSON("https://raw.githubusercontent.com/aelzeiny/sounds-of-smash-utlimate/main/data/sounds_of_smash.json", (soundsOfSmash) => {
        for (let sound of soundsOfSmash) {
            soundsOfSmashKV[sound.file] = sound;
            sound.enabledChar = true;
            sound.enabledType = true;
        }
        initSoundsOfSmash(soundsOfSmashKV);

    }).fail(function() {
        alert("Error fetching SoundsOfSmash data.");
    });
}

/**
 * CSS can't save me here. Adjust character well to truncate at bottom of screen. 
 */
function adjustCharacterWell() {
    const overflow = $('.char-list-unordered')[0];
    const { y } = overflow.getBoundingClientRect();
    $(overflow).css('height', window.innerHeight - y + 'px');
}

function initSearch() {
    const charSearch = $('#char-search');
    const chars = Array.from($('.char-list')).map($);
    const charNames = Array.from(chars).map(c => c.data('search').split(' '));
    charSearch.on('input', () => {
        const searchTerms = charSearch.val().toLowerCase().split(' ');
        for (let c = 0; c < charNames.length; c++) {
            let foundTerm = false;
            for (let t = 0; t < charNames[c].length && !foundTerm; t++) {
                const name = charNames[c][t];
                for (let term of searchTerms) {
                    if (name.includes(term)) {
                        foundTerm = true;
                        break;
                    }
                }
            }
            chars[c].css('display', foundTerm ? 'list-item' : 'none');
        }
    });
}

function initCharacterFilters() {
    const enabledChars = new Set($('.char-list').map((_, e) => e.dataset.name));

    function updateCharList(chars, shouldEnable) {
        if (!shouldEnable) {
            chars.addClass('disabled');
            for (let char of Array.from(chars)) {
                enabledChars.delete(char.dataset.name);
            }
        } else {
            chars.removeClass('disabled');
            for (let char of Array.from(chars)) {
                enabledChars.add(char.dataset.name);
            }
        }

        for (let sound of Object.values(soundsOfSmashKV)) {
            sound.enabledChar = false;
            for (let chr of sound.chars) {
                if (enabledChars.has(chr)) {
                    sound.enabledChar = true;
                    break;
                }
            }
        }
    }

    function updateCheckboxParent(box) {
        const char = box.parents('.char-list');
        updateCharList(char, box.prop('checked'));
    }

    function setAllFilters(shouldEnable) {
        const charList = $('.char-list');
        updateCharList(charList, shouldEnable);
        charList.find('.form-check-input').prop('checked', shouldEnable);
    }

    $('img').click((e) => {
        box = $(e.target).parent().find('.form-check-input');
        box.prop('checked', !box.prop('checked'));
        updateCheckboxParent(box);
    });
    $('.char-list .form-check-input').change((e) => updateCheckboxParent($(e.target)));
    $('#char-select-all').click(setAllFilters.bind(window, true));
    $('#char-select-none').click(setAllFilters.bind(window, false));
}

function initTypeFilters() {
    $('#type-select-all').click(() => {
        for (let sound of Object.values(soundsOfSmashKV)) {
            sound.enabledType = true;
        }
    });
    $('#type-select-voices').click(() => {
        for (let sound of Object.values(soundsOfSmashKV)) {
            sound.enabledType = sound.file.startsWith('vc_');
        }
    });
    $('#type-select-sfx').click(() => {
        for (let sound of Object.values(soundsOfSmashKV)) {
            sound.enabledType = sound.file.startsWith('se_');
        }
    });
}


$(document).ready(() => {
    $('#start-btn').click(start);
    adjustCharacterWell();
    start();
    initSearch();
    initCharacterFilters();
    initTypeFilters();
});

$(document).resize(adjustCharacterWell);