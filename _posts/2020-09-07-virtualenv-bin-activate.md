---
layout: post
title: ./.venv/bin/activate isn't magic
date: 2020-09-07
---

In Python, it's recommended to use
[`virtualenv`](https://docs.python.org/3/library/venv.html)s and run
`.venv/bin/activate` prior to running your program or project dependencies.

So what's in `.venv/bin/activate`, it must be some magic
[`sys.path`](https://docs.python.org/3.8/library/sys.html#sys.path) stuff
right?

That's what I always assumed, so I'd either `activate` the virtualenv, or use
`poetry run` which is roughly equivalent.

Let's take a look at the `.venv/bin/activate` source:

```shell
# This file must be used with "source bin/activate" *from bash*
# you cannot run it directly

deactivate () {
    # reset old environment variables
    if [ -n "${_OLD_VIRTUAL_PATH:-}" ] ; then
        PATH="${_OLD_VIRTUAL_PATH:-}"
        export PATH
        unset _OLD_VIRTUAL_PATH
    fi
    if [ -n "${_OLD_VIRTUAL_PYTHONHOME:-}" ] ; then
        PYTHONHOME="${_OLD_VIRTUAL_PYTHONHOME:-}"
        export PYTHONHOME
        unset _OLD_VIRTUAL_PYTHONHOME
    fi

    # This should detect bash and zsh, which have a hash command that must
    # be called to get it to forget past commands.  Without forgetting
    # past commands the $PATH changes we made may not be respected
    if [ -n "${BASH:-}" -o -n "${ZSH_VERSION:-}" ] ; then
        hash -r
    fi

    if [ -n "${_OLD_VIRTUAL_PS1:-}" ] ; then
        PS1="${_OLD_VIRTUAL_PS1:-}"
        export PS1
        unset _OLD_VIRTUAL_PS1
    fi

    unset VIRTUAL_ENV
    if [ ! "$1" = "nondestructive" ] ; then
    # Self destruct!
        unset -f deactivate
    fi
}

# unset irrelevant variables
deactivate nondestructive

VIRTUAL_ENV="/private/var/folders/6_/l5dqqh5x2f927hbmrsrnw_840000gp/T/tmp.De1HsaCn/.venv"
export VIRTUAL_ENV

_OLD_VIRTUAL_PATH="$PATH"
PATH="$VIRTUAL_ENV/bin:$PATH"
export PATH

# unset PYTHONHOME if set
# this will fail if PYTHONHOME is set to the empty string (which is bad anyway)
# could use `if (set -u; : $PYTHONHOME) ;` in bash
if [ -n "${PYTHONHOME:-}" ] ; then
    _OLD_VIRTUAL_PYTHONHOME="${PYTHONHOME:-}"
    unset PYTHONHOME
fi

if [ -z "${VIRTUAL_ENV_DISABLE_PROMPT:-}" ] ; then
    _OLD_VIRTUAL_PS1="${PS1:-}"
    if [ "x(.venv) " != x ] ; then
	PS1="(.venv) ${PS1:-}"
    else
    if [ "`basename \"$VIRTUAL_ENV\"`" = "__" ] ; then
        # special case for Aspen magic directories
        # see http://www.zetadev.com/software/aspen/
        PS1="[`basename \`dirname \"$VIRTUAL_ENV\"\``] $PS1"
    else
        PS1="(`basename \"$VIRTUAL_ENV\"`)$PS1"
    fi
    fi
    export PS1
fi

# This should detect bash and zsh, which have a hash command that must
# be called to get it to forget past commands.  Without forgetting
# past commands the $PATH changes we made may not be respected
if [ -n "${BASH:-}" -o -n "${ZSH_VERSION:-}" ] ; then
    hash -r
fi
```

Kind of lot there, let's remove all the deactivation and shell prompt stuff to make the functionality more clear.

```shell
VIRTUAL_ENV="/private/var/folders/6_/l5dqqh5x2f927hbmrsrnw_840000gp/T/tmp.De1HsaCn/.venv"
export VIRTUAL_ENV

PATH="$VIRTUAL_ENV/bin:$PATH"
export PATH
```

So all `activate` does is add the `.venv/bin` directory to the shell's path,
which means we can call `python`, `black`, `mypy`, `gunicorn`, etc. directly
rather than with a prefix `.venv/`.

If you don't mind prefixing your tools with `.venv/`, you can skip `.venv/bin/activate`.

Of course, `node` seems to have this all figured out where it will
automatically check in `node_modules` for dependencies when executing a program.

[PEP 582 -- Python local packages directory](https://www.python.org/dev/peps/pep-0582/) from May 2018 outlines
similar functionality to `node` for `python` with a `node_modules` equivalent called
`__pypackages__`. However, it's still in the draft phase so we're stuck with
`virtualenv`s for the foreseeable future.

## RTFM

I never actually read the [docs on
`virtualenv`s](https://docs.python.org/3/library/venv.html) until writing
this post, and they outline that activating a virtualenv is entirely
optional.

> You don’t specifically need to activate an environment; activation just
> prepends the virtual environment’s binary directory to your path, so that
> “python” invokes the virtual environment’s Python interpreter and you can run
> installed scripts without having to use their full path. However, all scripts
> installed in a virtual environment should be runnable without activating it,
> and run with the virtual environment’s Python automatically.
