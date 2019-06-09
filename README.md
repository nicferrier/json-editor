# A JSON editor

This is an ES6 module for editing a JSON file.

![image of the editor]{json-editor-image.png}

It performs validation based on JSON syntax but also can be extended
with further checking.


## ES6

These days it's important that we make things available via ES6
modules.

This is still really hard with the mostly node based infrastructure we
have. So I've written a translation layer that can be employed to try
and adapt node like code into ES6 modules.

This is provided by an express middleware called `es6Middleware`.

What this does is allow a sort of template file to be written which
provides a translation of a module via parsing.


## Distributing ES6 modules

This is frustrating too. I don't know how to distribute this module
either except that I would prefer to use npm.

For now either use direct handlers to provide things out of
node_modules or provide another translation layer.
