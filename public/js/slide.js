require('../css/extra.css');
require('../css/site.css');

import { md, updateLastChange, finishView } from './extra';

import { preventXSS } from './render';

const body = $(".slides").text();

createtime = lastchangeui.time.attr('data-createtime');
lastchangetime = lastchangeui.time.attr('data-updatetime');
updateLastChange();
const url = window.location.pathname;
$('.ui-edit').attr('href', `${url}/edit`);

$(document).ready(() => {
    //tooltip
    $('[data-toggle="tooltip"]').tooltip();
});

function extend() {
    const target = {};

    for (const source of arguments) {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }

    return target;
}

// Optional libraries used to extend on reveal.js
const deps = [{
    src: `${serverurl}/build/reveal.js/lib/js/classList.js`,
    condition() {
        return !document.body.classList;
    }
}, {
    src: `${serverurl}/js/reveal-markdown.js`,
    callback() {
        const slideOptions = {
            separator: '^(\r\n?|\n)---(\r\n?|\n)$',
            verticalSeparator: '^(\r\n?|\n)----(\r\n?|\n)$'
        };
        const slides = RevealMarkdown.slidify(body, slideOptions);
        $(".slides").html(slides);
        RevealMarkdown.initialize();
        $(".slides").show();
    }
}, {
    src: `${serverurl}/build/reveal.js/plugin/notes/notes.js`,
    async: true,
    condition() {
        return !!document.body.classList;
    }
}];

// default options to init reveal.js
const defaultOptions = {
    controls: true,
    progress: true,
    slideNumber: true,
    history: true,
    center: true,
    transition: 'none',
    dependencies: deps
};

// options from yaml meta
const meta = JSON.parse($("#meta").text());
var options = meta.slideOptions || {};

const view = $('.reveal');

//text language
if (meta.lang && typeof meta.lang == "string") {
    view.attr('lang', meta.lang);
} else {
    view.removeAttr('lang');
}
//text direction
if (meta.dir && typeof meta.dir == "string" && meta.dir == "rtl") {
    options.rtl = true;
} else {
    options.rtl = false;
}
//breaks
if (typeof meta.breaks === 'boolean' && !meta.breaks) {
    md.options.breaks = false;
} else {
    md.options.breaks = true;
}

// options from URL query string
const queryOptions = Reveal.getQueryHash() || {};

var options = extend(defaultOptions, options, queryOptions);
Reveal.initialize(options);

window.viewAjaxCallback = () => {
    Reveal.layout();
};

function renderSlide(event) {
    if (window.location.search.match( /print-pdf/gi )) {
        const slides = $('.slides');
        var title = document.title;
        finishView(slides);
        document.title = title;
        Reveal.layout();
    } else {
        const markdown = $(event.currentSlide);
        if (!markdown.attr('data-rendered')) {
            var title = document.title;
            finishView(markdown);
            markdown.attr('data-rendered', 'true');
            document.title = title;
            Reveal.layout();
        }
    }
}

Reveal.addEventListener('ready', event => {
    renderSlide(event);
    const markdown = $(event.currentSlide);
    // force browser redraw
    setTimeout(() => {
        markdown.hide().show(0);
    }, 0);
});
Reveal.addEventListener('slidechanged', renderSlide);

const isMacLike = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false;

if (!isMacLike) $('.container').addClass('hidescrollbar');
