bzork
=====

Z-machine interpreter for your browser.

Primary goal is just to see the mailbox, for now. That will take quite a while.
Zork 1 is most readily available as a .z3, so I'm primarily aiming to support those first.

Because I am relying on [DataView](https://developer.mozilla.org/en/JavaScript_typed_arrays/DataView)
for handling the byte arrays that are at the core of a Z-Machine, this will currently
only run on Chrome 9+. I may or may not get around to implementing writing in jDataView,
which would allow me to fall back on that in other browsers. We'll see.

Reference Materials
-------------------

Targetting the 1.0 standard detailed [here](http://www.inform-fiction.org/zmachine/standards/index.html).
Quetzal and Blork won't be relevant for ages.
