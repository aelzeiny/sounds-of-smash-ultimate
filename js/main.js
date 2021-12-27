/**
 * Launch the canvas. Hide headphone warning.
 */
function start() {
    $('#headphone-warning').addClass('hidden');
    $('#filter-bar').removeClass('hidden');
    $.getJSON("https://raw.githubusercontent.com/aelzeiny/sounds-of-smash-utlimate/main/data/sounds_of_smash.json", (soundsOfSmash) => {
        const soundsOfSmashKV = {};
        for (let sound of soundsOfSmash) {
            soundsOfSmashKV[sound.file] = sound;
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
        const searchTerms = charSearch.val().split(' ');
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

$(document).ready(() => {
    $('#start-btn').click(start);
    adjustCharacterWell();
    // start();
    initSearch();

    function updateCheckboxParent(box) {
        const char = box.parents('.char-list');
        if (!box.prop('checked')) {
            char.addClass('disabled');
        } else {
            char.removeClass('disabled');
        }
    }

    $('img').click((e) => {
        box = $(e.target).parent().find('.form-check-input');
        box.prop('checked', !box.prop('checked'));
        updateCheckboxParent(box);
    });

    // Checkbox Mojo
    $('.char-list .form-check-input').change((e) => updateCheckboxParent($(e.target)));

    // Filter all / none
    function setAllFilters(selectAll) {
        const charList = $('.char-list');
        if (selectAll)
            charList.removeClass('disabled');
        else
            charList.addClass('disabled');
        charList.find('.form-check-input').prop('checked', selectAll);
    }
    $('#char-select-all').click(setAllFilters.bind(window, true));
    $('#char-select-none').click(setAllFilters.bind(window, false));
});

$(document).resize(adjustCharacterWell);