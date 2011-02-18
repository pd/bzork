bzork
=====

Z-machine interpreter for your browser.

Primary goal is just to see the mailbox, for now. That will take quite a while.
Zork 1 is most readily available as a .z3, so I'm primarily aiming to support those first.

Because I am relying on [DataView](https://developer.mozilla.org/en/JavaScript_typed_arrays/DataView)
for handling the byte arrays that are at the core of a Z-Machine, this will run natively only
on Chrome 9+. I am also using a pure JS implementation of DataView atop the typed arrays which
should enable it to run on any browser currently supporting JS typed arrays (FF4+, Chrome 7+,
dunno which Safaris but presumably some if they are keeping their WebKit up to date).

Support for browsers with JS typed arrays may or may not come, depending on whether I get around
to coding support for writing into jDataView or some such.

Reference Materials
-------------------

Targetting the 1.0 standard detailed [here](http://www.inform-fiction.org/zmachine/standards/index.html).
Quetzal and Blork won't be relevant for ages.
