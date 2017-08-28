// ------------------------------------------------------------------------------
// letter avatars http://codepen.io/arturheinze/pen/ZGvOMw
	/*
     * LetterAvatar
     * 
     * Artur Heinze
     * Create Letter avatar based on Initials
     * based on https://gist.github.com/leecrossley/6027780
     */
    (function(w, d){


        function LetterAvatar (name, size) {

            name  = name || '';
            size  = size || 60;

            var colours = [
                    "#e53935", "#d81b60", "#8e24aa", "#5e35b1", "#3949ab", "#1e88e5", "#0288d1", "#0097a7",
                    "#00796b", "#43a047", "#7cb342", "#c0ca33", "#fdd835", "#ffb300", "#fb8c00", "#f4511e",
                    "#c62828", "#ad1457", "#6a1b9a", "#4527a0", "#3d5afe", "#2979ff", "#0277bd", "#00838f",
                    "#00695c", "#2e7d32", "#558b2f", "#9e9d24", "#f9a825", "#ff8f00", "#ef6c00", "#d84315"
                ],

                nameSplit = String(name).toUpperCase().split(' '),
                initials, charIndex, colourIndex, canvas, context, dataURI;


            if (nameSplit.length == 1) {
                initials = nameSplit[0] ? nameSplit[0].charAt(0):'?';
            } else {
                initials = nameSplit[0].charAt(0) + nameSplit[1].charAt(0);
            }

            if (w.devicePixelRatio) {
                size = (size * w.devicePixelRatio);
            }
                
            charIndex     = (initials == '?' ? 72 : initials.charCodeAt(0)) - 64;
            colourIndex   = charIndex % 32;
            canvas        = d.createElement('canvas');
            canvas.width  = size;
            canvas.height = size;
            context       = canvas.getContext("2d");
             
            context.fillStyle = colours[colourIndex - 1];
            context.fillRect (0, 0, canvas.width, canvas.height);
            context.font = Math.round(canvas.width/2)+"px Arial";
            context.textAlign = "center";
            context.fillStyle = "#FFF";
            //context.fillText(initials, size / 2, size / 1.5);
            context.fillText(initials.charAt(0), size / 2, size / 1.5); //using one character only

            dataURI = canvas.toDataURL();
            canvas  = null;

            return dataURI;
        }

        LetterAvatar.transform = function() {

            Array.prototype.forEach.call(d.querySelectorAll('img[avatar]'), function(img, name) {
                name = img.getAttribute('avatar');
                img.src = LetterAvatar(name, img.getAttribute('width'));
                img.removeAttribute('avatar');
                img.setAttribute('alt', name);
            });
        };


        // AMD support
        if (typeof define === 'function' && define.amd) {
            
            define(function () { return LetterAvatar; });
        
        // CommonJS and Node.js module support.
        } else if (typeof exports !== 'undefined') {
            
            // Support Node.js specific `module.exports` (which can be a function)
            if (typeof module != 'undefined' && module.exports) {
                exports = module.exports = LetterAvatar;
            }

            // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
            exports.LetterAvatar = LetterAvatar;

        } else {
            
            window.LetterAvatar = LetterAvatar;

            d.addEventListener('DOMContentLoaded', function(event) {
                LetterAvatar.transform();
            });
        }

    })(window, document);

// ------------------------------------------------------------------------------
// justcontext.js https://github.com/turbo/justContext.js/blob/master/README.md
function isNotBatman(a, h) {
	for (; a && a !== document; a = a.parentNode) {
		if (a.classList.contains(h.substr(1))) {
			return 1;
		}
	}
}

function fadeElement(a, b) {
	if (b !== 'show') {
		return a.style.opacity = setTimeout(function() {
			a.style.display = 'none';
		}, 200) * 0;
	}
	a.style.display = 'block';
	setTimeout(function() {
		a.style.opacity = 1;
	}, 30);
}

function addListener(a, b, c) {
	(( typeof a == "string") ? document.querySelector(a) : a).addEventListener(b, c);
}

function addContextMenu() {
    Array.from(document.querySelectorAll(".jctx-host")).forEach((z, i) => {
        addListener(z, "contextmenu", function(event) {
            Array.from(document.querySelectorAll(".jctx")).forEach((k, i) => {
                k.style.display = 'none';
            });
            event.preventDefault();
            var mID = '';
            Array.from(z.classList).forEach((y, i) => {
                if (~y.indexOf("jctx-id-")) {
                    mID = '.' + y;
                }
            });
            x = document.querySelector(".jctx" + mID);
            var maxLeft = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) - 10 - x.getBoundingClientRect().width;
            var maxTop = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 10 - x.getBoundingClientRect().height;
            fadeElement(x, 'show');
            x.dataset.chipName = z.textContent;
            x.dataset.id = z.getAttribute('id');
            x.dataset.type = getChipType(z);
            x.style.left = (event.pageX > maxLeft ? maxLeft : event.pageX) + "px";
            x.style.top = (event.pageY > maxTop ? maxTop : event.pageY) + "px";
        })
    });
    Array.from(document.querySelectorAll(".jctx li")).forEach((x, i) => {
        addListener(x, "click", function() {
            if (eval("typeof(handleMenuAction)==typeof(Function)") && !x.classList.contains("disabled")) handleMenuAction(x.getAttribute("data-action"), this);
            fadeElement(x.parentElement, 'hide');
        })
    });
    addListener(document, "mousedown", function(e) {
        if (!isNotBatman(e.target, ".jctx-host")) Array.from(document.querySelectorAll(".jctx")).forEach((x, i) => {
            fadeElement(x, 'hide');
        })
    })
}

function handleMenuAction(evt, trigger) {
	console.debug("_handleMenuAction for " + evt);
	if (evt == "open") {
		var xmlElement = getXmlElementById(trigger.parentNode.getAttribute("data-id"));
		var link = decodeURIComponent(xmlElement.getAttribute('link'));
		clickCount(xmlElement, link, "_blank");
	} else {
		fillModalAction(evt, trigger);
	$('#modalAction').openModal();
    Materialize.updateTextFields();
	}
    event.stopPropagation();
}