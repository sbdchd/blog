---
layout: post
date: 2019-07-31
title: "Replacing YAML With Dhall"
---

## The Challenges of YAML

YAML has become a standard way to configure software like CI, Configuration
Management Tools (Salt), and Schedulers (Kubernetes, Swarm).

It's arguably easier on the eyes than JSON, but it lacks both the structure
of a conventional language, which means no type checking, and the language
features to prevent repetitive config.

TypeScript and VSCode have shown how JSON files like the
`tsconfig.json` can gain typing through an associated json-schema.

We could probably develop json-schema's for our tools of choice, but we
wouldn't have tools of a full language to enable DRY. Additionally, the problem
of YAML as a config is exacerbated when templating comes into the mix, where
json-schema is no longer usable.

Now we can't simply eliminate YAML from our configs, but we can
write our config files in something that will compile to YAML.

[Dhall](https://dhall-lang.org) is a config language that provides the same types as YAML (objects,
arrays, string, bool, etc.) while adding functions and types.

To compare Dhall against YAML we are going to rewrite a `docker-compose.yml` file.
Since Dhall is statically typed, this also includes rewriting all of the
types. Additionally we are going to throw Python into the mix since
dataclasses and mypy, can create condensed, type-safe configs.

There are some other config formats such as [Jsonnet](https://jsonnet.org), [Nix](https://nixos.wiki/wiki/Nix_Expression_Language), [Jk](https://jkcfg.github.io/#/), [HCL](https://github.com/hashicorp/hcl), and [Starlark](https://github.com/bazelbuild/starlark) (a
limited subset of Python), which can help with repetition, but they lack
typing so we can't take advantage of a type checker.

### The Baseline

Although the baseline doesn't have any characteristic template tags `{{ }}`,
the `:latest` tag is replaced with the git sha via a call to `sed`.

```sh
sed -e "s/:latest$/:$TAG/" docker-compose.yml > docker-compose-shipit.yml
```

<details open>
    <summary><code>docker-compose.yml (69 LOC)</code></summary>

{% highlight yaml %}
# docker-compose.yml
version: "3"
services:
  nginx:
    image: recipeyak/nginx:latest
    ports:
      - "80:80"
    volumes:
      - react-static-files:/var/app/dist
      - django-static-files:/var/app/django/static
    logging:
      driver: syslog
      options:
        syslog-address: "udp://logs.papertrailapp.com:50183"
        tag: "{{.Name}}"
    depends_on:
      - django
      - react
  django:
    restart: always
    image: recipeyak/django:latest
    env_file:
      - .env-production
    volumes:
      - django-static-files:/var/app/static-files
    logging:
      driver: syslog
      options:
        syslog-address: "udp://logs.papertrailapp.com:50183"
        tag: "{{.Name}}"
    depends_on:
      - postgres
  postgres:
    image: recipeyak/postgres:latest
    ports:
      - "5432:5432"
    logging:
      driver: syslog
      options:
        syslog-address: "udp://logs.papertrailapp.com:50183"
        tag: "{{.Name}}"
    volumes:
      - pgdata:/var/lib/postgresql/data/
  pgdump:
    image: recipeyak/pgdump:latest
    env_file:
      - .env-production
    logging:
      driver: syslog
      options:
        syslog-address: "udp://logs.papertrailapp.com:50183"
        tag: "{{.Name}}"
  react:
    image: recipeyak/react:latest
    env_file:
      - .env-production
    volumes:
      - react-static-files:/var/app/dist
    logging:
      driver: syslog
      options:
        syslog-address: "udp://logs.papertrailapp.com:50183"
        tag: "{{.Name}}"
volumes:
  pgdata:
    driver: local
  django-static-files:
    driver: local
  react-static-files:
    driver: local
{% endhighlight %}

</details>

### Dhall

<details open>
    <summary><code>docker-compose.dhall (134 LOC)</code></summary>

{% highlight dhall %}
let map =
      https://raw.githubusercontent.com/dhall-lang/dhall-lang/master/Prelude/List/map

let Entry =
      https://raw.githubusercontent.com/dhall-lang/dhall-lang/master/Prelude/Map/Entry

let types = ./compose/v3/types.dhall

let defaults = ./compose/v3/defaults.dhall

let tag = "9023daa"

let logging =
      Some
      { driver =
          "syslog"
      , options =
          Some
          [ { mapKey =
                "syslog-address"
            , mapValue =
                Some
                ( types.StringOrNumber.String
                  "udp://logs.papertrailapp.com:50183"
                )
            }
          , { mapKey =
                "tag"
            , mapValue =
                Some (types.StringOrNumber.String "{{.Name}}")
            }
          ]
      }

let nginxService =
          defaults.Service
        ⫽ { image =
              Some "recipeyak/nginx:${tag}"
          , ports =
              Some [ types.StringOrNumber.String "80:80" ]
          , volumes =
              Some
              [ "react-static-files:/var/app/dist"
              , "django-static-files:/var/app/django/static"
              ]
          , logging =
              logging
          , depends_on =
              Some [ "django", "react" ]
          }
      : types.Service

let djangoService =
          defaults.Service
        ⫽ { restart =
              Some "always"
          , image =
              Some "recipeyak/django:${tag}"
          , env_file =
              Some (types.StringOrList.List [ ".env-production" ])
          , volumes =
              Some [ "django-static-files:/var/app/static-files" ]
          , logging =
              logging
          , depends_on =
              Some [ "db" ]
          }
      : types.Service

let dbService =
          defaults.Service
        ⫽ { image =
              Some "recipeyak/postgres:${tag}"
          , ports =
              Some [ types.StringOrNumber.String "5432:5432" ]
          , logging =
              logging
          , volumes =
              Some [ "pgdata:/var/lib/postgresql/data/" ]
          }
      : types.Service

let pgdumpService =
          defaults.Service
        ⫽ { image =
              Some "recipeyak/pgdump:${tag}"
          , env_file =
              Some (types.StringOrList.List [ ".env-production" ])
          , logging =
              logging
          }
      : types.Service

let reactService =
          defaults.Service
        ⫽ { image =
              Some "recipeyak/react:${tag}"
          , env_file =
              Some (types.StringOrList.List [ ".env-production" ])
          , volumes =
              Some [ "react-static-files:/var/app/dist" ]
          , logging =
              logging
          }
      : types.Service

let toEntry =
        λ(name : Text)
      → { mapKey =
            name
        , mapValue =
            Some (defaults.Volume ⫽ { driver = Some "local" })
        }

let Output : Type = Entry Text (Optional types.Volume)

let volumes
    : types.Volumes
    = map
      Text
      Output
      toEntry
      [ "pgdata", "django-static-files", "react-static-files" ]

let services
    : types.Services
    = [ { mapKey = "nginx", mapValue = nginxService }
      , { mapKey = "postgres", mapValue = dbService }
      , { mapKey = "pgdump", mapValue = pgdumpService }
      , { mapKey = "react", mapValue = reactService }
      , { mapKey = "django", mapValue = djangoService }
      ]

in      defaults.ComposeConfig
      ⫽ { services = Some services, volumes = Some volumes }
    : types.ComposeConfig
{% endhighlight %}

</details>

<details>
    <summary><code>./compose/v3/types.dhall (259 LOC)</code></summary>

{% highlight dhall %}
let Map =
      https://raw.githubusercontent.com/dhall-lang/dhall-lang/master/Prelude/Map/Type

let StringOrNumber : Type = < String : Text | Number : Natural >

let ListOrDict
    : Type
    = < Dict : Map Text Text | List : List (Optional StringOrNumber) >

let Build
    : Type
    = < String :
          Text
      | Object :
          { context : Text, Dockerfile : Text, args : ListOrDict }
      >

let StringOrList : Type = < String : Text | List : List Text >

let Healthcheck
    : Type
    = { disable :
          Bool
      , interval :
          Text
      , retries :
          Natural
      , test :
          StringOrList
      , timeout :
          Text
      }

let Labels : Type = < Object : Map Text Text | List : List Text >

let Options : Type = Map Text (Optional StringOrNumber)

let Logging : Type = { driver : Text, options : Optional Options }

let Networks
    : Type
    = < List :
          List Text
      | Object :
          Optional
          { aliases : List Text, ipv4_address : Text, ipv6_address : Text }
      >

let Ulimits
    : Type
    = < Int : Natural | Object : { hard : Natural, soft : Natural } >

let Resource : Type = { cpus : Text, memory : Text }

let Deploy
    : Type
    = { mode :
          Text
      , replicas :
          Natural
      , labels :
          Labels
      , update_config :
          { parallelism :
              Natural
          , delay :
              Text
          , failure_action :
              Text
          , monitor :
              Text
          , max_failure_ratio :
              Natural
          }
      , resources :
          { limits : Resource, reservations : Resource }
      , restartPolicy :
          { condition :
              Text
          , delay :
              Text
          , maxAttempts :
              Natural
          , window :
              Text
          }
      , placement :
          { constraints : List Text }
      }

let Service
    : Type
    = { deploy :
          Optional Deploy
      , build :
          Optional Build
      , cap_add :
          Optional (List Text)
      , cap_drop :
          Optional (List Text)
      , cgroup_parent :
          Optional Text
      , command :
          Optional StringOrList
      , container_name :
          Optional Text
      , depends_on :
          Optional (List Text)
      , devices :
          Optional (List Text)
      , dns :
          Optional StringOrList
      , dns_search :
          Optional (List Text)
      , domainname :
          Optional Text
      , entrypoint :
          Optional StringOrList
      , env_file :
          Optional StringOrList
      , environment :
          Optional ListOrDict
      , expose :
          Optional (List StringOrNumber)
      , external_links :
          Optional (List Text)
      , extra_hosts :
          Optional ListOrDict
      , healthcheck :
          Optional Healthcheck
      , hostname :
          Optional Text
      , image :
          Optional Text
      , ipc :
          Optional Text
      , labels :
          Optional Labels
      , links :
          Optional (List Text)
      , logging :
          Optional Logging
      , mac_address :
          Optional Text
      , network_mode :
          Optional Text
      , networks :
          Optional Networks
      , pid :
          Optional Text
      , ports :
          Optional (List StringOrNumber)
      , privileged :
          Optional Bool
      , read_only :
          Optional Bool
      , restart :
          Optional Text
      , security_opt :
          Optional (List Text)
      , shm_size :
          Optional StringOrNumber
      , sysctls :
          Optional ListOrDict
      , stdin_open :
          Optional Bool
      , stop_grace_period :
          Optional Text
      , stop_signal :
          Optional Text
      , tmpfs :
          Optional StringOrList
      , tty :
          Optional Bool
      , ulimits :
          Optional (Map Text Ulimits)
      , user :
          Optional Text
      , userns_mode :
          Optional Text
      , volumes :
          Optional (List Text)
      , working_dir :
          Optional Text
      }

let DriverOpts : Type = Map Text StringOrNumber

let Ipam : Type = { driver : Text, config : List { subnet : Text } }

let External : Type = < Bool : Bool | Object : { name : Text } >

let Volume
    : Type
    = { driver :
          Optional Text
      , driver_opts :
          Optional DriverOpts
      , ipam :
          Optional Ipam
      , external :
          Optional External
      }

let Volumes : Type = Map Text (Optional Volume)

let Services : Type = Map Text Service

let ComposeConfig
    : Type
    = { version :
          Text
      , services :
          Optional Services
      , networks :
          Optional Networks
      , volumes :
          Optional Volumes
      }

in  { ComposeConfig =
        ComposeConfig
    , Services =
        Services
    , Service =
        Service
    , StringOrNumber =
        StringOrNumber
    , Deploy =
        Deploy
    , Build =
        Build
    , StringOrList =
        StringOrList
    , ListOrDict =
        ListOrDict
    , Healthcheck =
        Healthcheck
    , Labels =
        Labels
    , Logging =
        Logging
    , Networks =
        Networks
    , Ulimits =
        Ulimits
    , Volumes =
        Volumes
    , Volume =
        Volume
    , Options =
        Options
    , DriverOpts =
        DriverOpts
    , Ipam =
        Ipam
    , External =
        External
    }
{% endhighlight %}

</details>

<details>
    <summary><code>./compose/v3/defaults.dhall (126 LOC)</code></summary>

{% highlight dhall %}
let Map =
      https://raw.githubusercontent.com/dhall-lang/dhall-lang/master/Prelude/Map/Type

let types = ./types.dhall

let Service =
        { deploy =
            None types.Deploy
        , build =
            None types.Build
        , cap_add =
            None (List Text)
        , cap_drop =
            None (List Text)
        , cgroup_parent =
            None Text
        , command =
            None types.StringOrList
        , container_name =
            None Text
        , depends_on =
            None (List Text)
        , devices =
            None (List Text)
        , dns =
            None types.StringOrList
        , dns_search =
            None (List Text)
        , domainname =
            None Text
        , entrypoint =
            None types.StringOrList
        , env_file =
            None types.StringOrList
        , environment =
            None types.ListOrDict
        , expose =
            None (List types.StringOrNumber)
        , external_links =
            None (List Text)
        , extra_hosts =
            None types.ListOrDict
        , healthcheck =
            None types.Healthcheck
        , hostname =
            None Text
        , image =
            None Text
        , ipc =
            None Text
        , labels =
            None types.Labels
        , links =
            None (List Text)
        , logging =
            None types.Logging
        , mac_address =
            None Text
        , network_mode =
            None Text
        , networks =
            None types.Networks
        , pid =
            None Text
        , ports =
            None (List types.StringOrNumber)
        , privileged =
            None Bool
        , read_only =
            None Bool
        , restart =
            None Text
        , security_opt =
            None (List Text)
        , shm_size =
            None types.StringOrNumber
        , sysctls =
            None types.ListOrDict
        , stdin_open =
            None Bool
        , stop_grace_period =
            None Text
        , stop_signal =
            None Text
        , tmpfs =
            None types.StringOrList
        , tty =
            None Bool
        , ulimits =
            None (Map Text types.Ulimits)
        , user =
            None Text
        , userns_mode =
            None Text
        , volumes =
            None (List Text)
        , working_dir =
            None Text
        }
      : types.Service

let Volume =
        { driver =
            None Text
        , driver_opts =
            None types.DriverOpts
        , ipam =
            None types.Ipam
        , external =
            None types.External
        }
      : types.Volume

let ComposeConfig =
        { version =
            "3"
        , services =
            None types.Services
        , networks =
            None types.Networks
        , volumes =
            None types.Volumes
        }
      : types.ComposeConfig

in  { Service = Service, Volume = Volume, ComposeConfig = ComposeConfig }
{% endhighlight %}

</details>

To convert the Dhall file below to yaml we need to use `dhall-to-yaml` which comes with [dhall-json](https://github.com/dhall-lang/dhall-haskell/blob/master/README.md)

```
dhall-to-yaml < "docker-compose.dhall" --omitNull > ./docker-compose-dhall.yml
```

Some things to note are that `dhall` utilites take arguments through stdin --
unusual and a bit confusing as it also inhibits listing filenames
in error outputs. We include `--omitNull` so we don't have a
bunch of `foo: null` keys throughout our file; keeps it tidy. Additionally,
`dhall-to-yaml` sorts yaml keys alphabetically -- not sure why.

As for the config file itself, first thing you might notice is the weird
formatting and I agree it is weird and more importantly it makes
items take up more lines than they need -- it's 136 LOC while the yaml is only
69\. Note that I'm not including the `types.dhall` and
`defaults.dhall` in the LOC count since they are essentially a library that
you write once and can just import.

#### Formatter

If you look closer you'll see some of the symbols are unicode. This is a
result of `dhall format` which handles formatting but also converts the asci
equivalents to unicode. So if you write `//`, the operator to merge two
records (objects), the formatter will convert it to `⫽`.

I think this should be a config option in `dhall format`
since writing these characters would be challenging to the novice who has
never read and docs on Dhall but is looking to change some of the config.
`//`, `->`, and `\` are longer than `⫽`, `→`, and `λ` but I instantly know
how to write them and search for them. I can recognize lambda but I'm not
sure about the other characters. how would you ask somewhat what `⫽` means? I
f it was `//` you could say, "Hey, what does double backslash mean?".

Additionally `dhall format` **remove comments** ([luckily there's an open issue for
this](https://github.com/dhall-lang/dhall-haskell/issues/145)).

#### Error Messages

While the formatting has issues, its the error messages that can make Dhall
frustrating to use.

Here is a short and sweet error to start us off:

```
Error: Invalid input

(stdin):83:17:
   |
83 |                 ]
   |                 ^^
unexpected "]<newline>      "
expecting expression or whitespace
```

because of a trailing comma

```dhall
let dbService = {
    image = "postgres:10.1",
    command = [
        "-c", "shared_preload_libraries=\"pg_stat_statements\"",
        "-c", "pg_stat_statements.max=10000",
        "-c", "pg_stat_statements.track=all", -- trailing comma
    ]
}
```

Here's a more cryptic error which tend to come up pretty often:

```
map : ∀(a : Type) → ∀(b : Type) → ∀(f : a → b) → ∀(xs : List a) → List b
defaults : { ComposeConfig :
               { networks :
                   Optional
           ===================================================================
                   Optional { config : List { subnet : Text }, driver : Text }
               }
           }
logging : Optional
          { driver :
              Text
          ==========
                }
              )
          }
nginxService : { build :
                   Optional
                   < Object :
               =================
               , working_dir :
                   Optional Text
               }
djangoService : { build :
                    Optional
                    < Object :
                =================
                , working_dir :
                    Optional Text
                }

Error: Expression doesn't match annotation

{ ports : : …
            ( …
              - < … : … >
              + Text
            )
, …
}

          defaults.Service
        ⫽ { image =
              Some "postgres:10.1"
      ============================
          }
      : types.Service


(stdin):71:11
```

Which turned out to be caused by a missing tag

```diff
                 ]
               )
           , ports =
-              Some [ types.StringOrNumber.String "5432:5432" ]
+              Some [ "5432:5432" ]
           , logging =
               logging
           , volumes =
```

There's also the occasional (only happened to me once) compiler bug

```
Error: Compiler bug

An ill-typed expression was encountered during normalization.
Explanation: This error message means that there is a bug in the Dhall compiler.
You didn't do anything wrong, but if you would like to see this problem fixed
then you should report the bug at:

https://github.com/dhall-lang/dhall-haskell/issues

CallStack (from HasCallStack):
  error, called at src/Dhall/Eval.hs:533:44 in dhall-1.22.0-8caKQev93YM1Go6QoVdNxT:Dhall.Eval
```

### Python

Now we could also just use Python, which means we have a complete programming
language, but this comes of the cost of not making guarantees about
termination like Dhall. We could also try using Skylark, a subset of Python that
has similar, self-imposed limitations like Dhall, but [Skylark doesn't support type
annotations](https://groups.google.com/forum/#!topic/bazel-dev/Pk9VrPCqby0).

In practice we might be able to monkey patch out problematic portions of Python
language we don't want available and/or include an aggressive linter.

For this example we'll just use [dataclasses](https://docs.python.org/3/library/dataclasses.html)
and Python's [typing](https://docs.python.org/3/library/typing.html) library. As
we can see below, the Python code has a similar length to the YAML it is replacing, but
with the added benefit of using tools that you may already be familiar with
including linters and formatters (black), as well as full type checking.

To actually generate the YAML from the Python we need to add another script
which takes in the dataclasses, converts them to `dict`s, and runs them through
a Python YAML library.

<details>
    <summary><code>dataclass_to_yaml.py</code></summary>

{% highlight python %}
import yaml
from dataclasses import asdict
from collections.abc import Mapping

def filter_none(d):
    """
    from: https://stackoverflow.com/a/54817412/3720597
    """
    if isinstance(d, Mapping):
        return {k: filter_none(v) for k, v in d.items() if v is not None}
    else:
        return d

from docker_compose_deploy import cfg

print(yaml.dump(filter_none(asdict(cfg)), default_flow_style=False))
{% endhighlight %}

</details>



<details open>
    <summary><code>docker_compose.py (70 LOC)</code></summary>

{% highlight python %}
from .types import ComposeConfig, Service, Logging, Volume

tag = "9023daa"

logging = Logging(
    driver="syslog",
    options={
        "syslog-address": "udp://logs.papertrailapp.com:50183",
        "tag": "{{.Name}}",
    },
)

nginx_service = Service(
    image=f"recipeyak/nginx:{tag}",
    ports=["80:80"],
    volumes=[
        "react-static-files:/var/app/dist",
        "django-static-files:/var/app/django/static",
    ],
    logging=logging,
    depends_on=["django", "react"],
)

django_service = Service(
    restart="always",
    image=f"recipeyak/django:{tag}",
    env_file=[".env_production"],
    volumes=["django-static-files:/var/app/static-files"],
    logging=logging,
    depends_on=["db"],
)

postgres_service = Service(
    image=f"recipeyak/postgres:{tag}",
    ports=["5432:5432"],
    logging=logging,
    volumes=["pgdata:/var/lib/postgresql/data/"],
)

pgdump_service = Service(
    image=f"recipeyak/pgdump:{tag}", env_file=[".env-production"], logging=logging
)

react_service = Service(
    image=f"recipeyak/react:{tag}",
    env_file=[".env-production"],
    volumes=["react-static-files:/var/app/dist"],
    logging=logging,
)

volumes = dict(
    (name, Volume(driver="local"))
    for name in ["pgdata", "django-static-files", "react-static-files"]
)

services = dict(
    nginx=nginx_service,
    pgdump=pgdump_service,
    postgres=postgres_service,
    react=react_service,
    django=django_service,
)

cfg = ComposeConfig(services=services, volumes=volumes)
{% endhighlight %}

</details>

<details>
    <summary><code>types.py (190 LOC)</code></summary>

{% highlight python %}
from typing import Optional, Mapping, List, NamedTuple, TypeVar, Union
from dataclasses import dataclass

StringOrList = Union[str, List[str]]

StringOrNumber = Union[str, int]

ListOrDict = Union[List[Optional[StringOrNumber]], Mapping[str, str]]


@dataclass
class Network:
    aliases: List[str]
    ipv4_address: str
    ipv6_address: str


Networks = Union[List[str], Optional[Network]]


@dataclass
class Ulimit:
    hard: int
    soft: int


Ulimits = Union[int, Ulimit]

Labels = Union[Mapping[str, str], List[str]]


@dataclass
class UpdateConfig:
    parallelism: int
    deplay: str
    failure_action: str
    monitor: str
    max_failure_ratio: int


@dataclass
class Resource:
    cpus: str
    memory: str


@dataclass
class Resources:
    limits: Resource
    reservations: Resource


@dataclass
class RestartPolicy:
    condition: str
    deplay: str
    max_attempts: int
    window: str


@dataclass
class Placement:
    constraints: List[str]


@dataclass
class Deploy:
    mode: str
    replicas: int
    labels: Labels
    update_config: UpdateConfig
    resources: Resources
    restartPolicy: RestartPolicy
    placement: Placement


@dataclass
class BuildObj:
    context: str
    Dockerfile: str
    args: ListOrDict


Build = Union[str, BuildObj]


@dataclass
class Healthcheck:
    disable: bool
    interval: str
    retries: int
    test: StringOrList
    timeout: str


Options = Mapping[str, Optional[StringOrNumber]]


@dataclass
class Logging:
    driver: str
    options: Optional[Options] = None


@dataclass
class Service:
    deploy: Optional[Deploy] = None
    build: Optional[Build] = None
    cap_add: Optional[List[str]] = None
    cap_drop: Optional[List[str]] = None
    cgroup_parent: Optional[str] = None
    command: Optional[str] = None
    container_name: Optional[str] = None
    depends_on: Optional[List[str]] = None
    devices: Optional[List[str]] = None
    dns: Optional[StringOrList] = None
    dns_search: Optional[List[str]] = None
    domainname: Optional[str] = None
    entrypoint: Optional[str] = None
    env_file: Optional[StringOrList] = None
    environment: Optional[ListOrDict] = None
    expose: Optional[List[StringOrNumber]] = None
    external_links: Optional[List[str]] = None
    extra_hosts: Optional[ListOrDict] = None
    healthcheck: Optional[Healthcheck] = None
    hostname: Optional[str] = None
    image: Optional[str] = None
    ipc: Optional[str] = None
    labels: Optional[Labels] = None
    links: Optional[List[str]] = None
    logging: Optional[Logging] = None
    mac_address: Optional[str] = None
    network_mode: Optional[str] = None
    networks: Optional[Networks] = None
    pid: Optional[str] = None
    ports: Optional[List[StringOrNumber]] = None
    privileged: Optional[bool] = None
    read_only: Optional[bool] = None
    restart: Optional[str] = None
    security_opt: Optional[List[str]] = None
    shm_size: Optional[StringOrNumber] = None
    sysctls: Optional[ListOrDict] = None
    stdin_open: Optional[bool] = None
    stop_grace_period: Optional[str] = None
    stop_signal: Optional[StringOrList] = None
    tmpfs: Optional[StringOrList] = None
    tty: Optional[bool] = None
    ulimits: Optional[Mapping[str, Ulimits]] = None
    user: Optional[str] = None
    userns_mode: Optional[str] = None
    volumes: Optional[List[str]] = None
    working_dir: Optional[str] = None


DriverOpts = Mapping[str, StringOrNumber]


@dataclass
class ExternalObj:
    name: str


External = Union[bool, ExternalObj]


@dataclass
class Subnet:
    subnet: str


@dataclass
class Ipam:
    driver: str
    config: List[Subnet]


@dataclass
class Volume:
    driver: Optional[str] = None
    driver_opts: Optional[DriverOpts] = None
    ipam: Optional[Ipam] = None
    external: Optional[External] = None


@dataclass
class ComposeConfig:
    version = "3"
    services: Optional[Mapping[str, Service]] = None
    networks: Optional[Networks] = None
    volumes: Optional[Mapping[str, Optional[Volume]]] = None
{% endhighlight %}

</details>

## Conclusion

YAML leaves a lot of room for improvement and although Dhall is currently a
bit rough around the edges, Dhall provides an excellent solution to ensure DRY
principles as well as helpful type-checking. The Python solution provides a
nice comparison, but lacks the statically linked binary of Dhall for generating
YAML.
