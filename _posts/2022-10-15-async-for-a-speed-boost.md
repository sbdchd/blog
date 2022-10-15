---
layout: post
title: Sync to Async Python for Speed
description: 10x perf gains by using asyncio in Python
---

Lately I've been noticing [recipeyak](https://github.com/recipeyak/recipeyak)'s API is kind of slow and after having success using asyncio with [kodiak](https://kodiakhq.com), I thought it would be good to benchmark sync Python against async Python.

Also I threw in a Rust implementation for kicks.

## setup

architecture:

```
client (oha) -> haproxy -> http server -> postgres
```

client: my laptop (in Boston)

servers:

| service                                      | vCPUs | Memory | Storage | Price   | Region |
| -------------------------------------------- | ----- | ------ | ------- | ------- | ------ |
| haproxy                                      | 2     | 4 GB   | 80 GB   | \$28/mo | NYC    |
| http server                                  | 2     | 4 GB   | 80 GB   | \$28/mo | NYC    |
| postgres (v14) w/ pgbouncer (25 connections) | 2     | 4 GB   | 38 GB   | \$60/mo | NYC    |

haproxy config:

```conf
# /etc/haproxy/haproxy.cfg
global
    stats timeout 30s
    daemon

defaults
    log	global
    mode http
    option httplog
    timeout connect 5s
    timeout client 30s
    timeout server 30s

frontend front
    bind *:80
    use_backend api if { path_beg /api/v1/ }

backend api
    server recipes 10.0.0.1:8080 maxconn 25
```

Note: I took the max connection count [from](https://www.haproxy.com/blog/play_with_maxconn_avoid_server_slowness_or_crash/) [the docs](https://www.haproxy.com/blog/four-examples-of-haproxy-rate-limiting/), but changing it up or down
didn't seem to affect anything as the servers didn't get overloaded.

Also I didn't setup TLS but I don't think it should affect the various results
too much because haproxy would handle the termination.

client [`oha` (version 0.5.2) command](https://github.com/hatoo/oha):

```bash
oha -z 1m -c 50 --no-tui \
    -H 'Cookie: sessionid=$SESSION_ID' 'http://$IP/api/v1/recipes'
```

also used [`psrecord`](https://github.com/astrofrog/psrecord) to record CPU and memory usage:

```
psrecord --interval 1 --include-children --log $logname.log $PID
```

## results

### python (sync): django + psycopg

Chose 5 workers as [gunicorn docs suggest](https://docs.gunicorn.org/en/stable/design.html#how-many-workers) `(2 * os.cpu_count()) + 1`

```shell
./.venv/bin/gunicorn \
    -w 5 \
    main:app \
    -b 0.0.0.0:8080 \
    --access-logfile - \
    --error-logfile - \
    --capture-output \
    --enable-stdio-inheritance \
    --access-logformat 'request="%(r)s" request_time=%(L)s remote_addr="%(h)s" request_id=%({X-Request-Id}i)s response_id=%({X-Response-Id}i)s method=%(m)s protocol=%(H)s status_code=%(s)s response_length=%(b)s referer="%(f)s" process_id=%(p)s user_agent="%(a)s"'
```

Also [tried using `--threads`](https://docs.gunicorn.org/en/latest/settings.html#threads) but it didn't make a difference in performance.

```
Summary:
  Success rate:	1.0000
  Total:	60.0026 secs
  Slowest:	1.6509 secs
  Fastest:	0.2181 secs
  Average:	0.8512 secs
  Requests/sec:	58.3474

  Total data:	11.95 MiB
  Size/request:	3.49 KiB
  Size/sec:	203.91 KiB

Response time histogram:
  0.348 [6]    |
  0.479 [18]   |
  0.609 [114]  |■■■
  0.739 [1131] |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.869 [1015] |■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  1.000 [335]  |■■■■■■■■■
  1.130 [495]  |■■■■■■■■■■■■■■
  1.260 [253]  |■■■■■■■
  1.390 [86]   |■■
  1.521 [35]   |
  1.651 [13]   |

Latency distribution:
  10% in 0.6521 secs
  25% in 0.7046 secs
  50% in 0.7903 secs
  75% in 1.0018 secs
  90% in 1.1429 secs
  95% in 1.2335 secs
  99% in 1.4102 secs

Details (average, fastest, slowest):
  DNS+dialup:	0.0345 secs, 0.0252 secs, 0.0416 secs
  DNS-lookup:	0.0000 secs, 0.0000 secs, 0.0001 secs

Status code distribution:
  [200] 3501 responses
```

perf log

```
# Elapsed time   CPU (%)     Real (MB)
       0.000        0.000      227.293
       1.004        0.000      227.293
       2.008        0.000      227.293
       3.012        0.000      227.293
       4.016        0.000      227.293
       5.020        0.000      227.293
       6.025        0.000      227.293
       7.031        0.000      227.293
       8.035        0.000      227.293
       9.040        0.000      227.293
      10.044        0.000      227.293
      11.048       48.000      274.422
      12.052       38.000      274.422
      13.056       40.000      274.422
      14.060       34.000      274.422
      15.064       41.000      274.422
      16.068       35.000      274.422
      17.072       35.000      274.422
      18.077       36.000      274.422
      19.081       37.000      274.422
      20.085       36.000      274.422
      21.089       32.000      274.422
      22.093       42.900      274.422
      23.099       34.000      274.422
      24.104       39.000      274.422
      25.108       35.000      274.422
      26.112       27.000      274.422
      27.117       32.000      274.422
      28.121       40.000      274.422
      29.127       43.000      274.422
      30.132       42.000      274.422
      31.136       39.000      274.422
      32.141       37.000      274.422
      33.145       37.000      274.422
      34.149       35.000      274.422
      35.153       28.000      274.422
      36.157       38.000      274.422
      37.161       29.000      274.422
      38.165       37.000      274.672
      39.169       38.000      274.672
      40.173       36.000      275.176
      41.177       36.000      275.176
      42.182       32.000      275.176
      43.187       33.000      275.176
      44.191       34.000      275.422
      45.195       37.000      275.672
      46.199       32.000      275.672
      47.202       35.000      275.672
      48.207       36.000      275.672
      49.211       37.000      275.672
      50.215       37.000      275.672
      51.219       44.000      275.672
      52.224       47.800      275.672
      53.229       46.500      275.672
      54.235       43.000      275.672
      55.240       37.000      275.672
      56.244       31.000      275.672
      57.249       32.000      275.672
      58.253       40.000      275.672
      59.257       36.000      275.672
      60.261       39.000      275.672
      61.265       36.000      275.672
      62.269       35.000      275.672
      63.273       35.000      275.672
      64.277       40.000      275.672
      65.281       29.000      275.672
      66.287       36.000      275.672
      67.291       40.000      275.672
      68.297       37.000      275.672
      69.301       36.000      275.672
      70.305       39.000      275.672
      71.309       19.000      275.672
      72.313        0.000      275.672
```

### python (async): starlette + asyncpg

```shell
./.venv/bin/gunicorn \
    -w 2 \
    -k uvicorn.workers.UvicornWorker \
    -b 0.0.0.0:3000 main:app \
    --access-logfile - \
    --error-logfile - \
    --capture-output \
    --enable-stdio-inheritance \
    --access-logformat 'request="%(r)s" request_time=%(L)s remote_addr="%(h)s" request_id=%({X-Request-Id}i)s response_id=%({X-Response-Id}i)s method=%(m)s protocol=%(H)s status_code=%(s)s response_length=%(b)s referer="%(f)s" process_id=%(p)s user_agent="%(a)s"'
```

```
Summary:
  Success rate:	1.0000
  Total:	60.0037 secs
  Slowest:	0.3148 secs
  Fastest:	0.0424 secs
  Average:	0.1009 secs
  Requests/sec:	495.3030

  Total data:	103.01 MiB
  Size/request:	3.55 KiB
  Size/sec:	1.72 MiB

Response time histogram:
  0.066 [1809]  |■■■■■
  0.090 [8589]  |■■■■■■■■■■■■■■■■■■■■■■■
  0.113 [11554] |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.137 [5272]  |■■■■■■■■■■■■■■
  0.161 [1661]  |■■■■
  0.184 [499]   |■
  0.208 [207]   |
  0.232 [84]    |
  0.255 [32]    |
  0.279 [9]     |
  0.303 [4]     |

Latency distribution:
  10% in 0.0697 secs
  25% in 0.0812 secs
  50% in 0.0991 secs
  75% in 0.1143 secs
  90% in 0.1332 secs
  95% in 0.1479 secs
  99% in 0.1866 secs

Details (average, fastest, slowest):
  DNS+dialup:	0.0308 secs, 0.0253 secs, 0.0376 secs
  DNS-lookup:	0.0000 secs, 0.0000 secs, 0.0001 secs

Status code distribution:
  [200] 29720 responses
```

perf log

```
# Elapsed time   CPU (%)     Real (MB)
       0.000        0.000      112.832
       1.004        0.000      112.832
       2.010        0.000      112.832
       3.014        1.000      112.832
       4.018        0.000      112.832
       5.022        0.000      112.832
       6.026        1.000      112.832
       7.029        0.000      112.832
       8.034        4.000      114.289
       9.037        0.000      114.289
      10.041        1.000      114.289
      11.045        7.000      115.516
      12.049       38.800      116.289
      13.053       81.600      117.574
      14.057       94.600      118.863
      15.061      106.600      120.152
      16.065      141.400      121.957
      17.070      131.400      123.504
      18.075      143.200      125.051
      19.079      154.400      126.598
      20.083      142.400      128.402
      21.087      148.400      129.949
      22.091      143.400      131.496
      23.096      138.400      133.043
      24.100      141.400      134.074
      25.104      142.500      134.590
      26.108      122.400      135.105
      27.112      121.600      135.363
      28.116      140.400      135.879
      29.120      133.600      135.879
      30.124      136.400      135.879
      31.127      136.500      136.395
      32.131      132.400      136.652
      33.136      134.400      136.652
      34.140      143.400      136.910
      35.144      135.400      137.168
      36.147      143.400      137.941
      37.152      130.600      138.457
      38.156      134.400      138.715
      39.160      130.400      139.230
      40.164      133.400      139.746
      41.168      142.600      140.004
      42.172      135.400      140.262
      43.176      147.300      140.262
      44.180      163.400      140.520
      45.184      158.200      141.035
      46.189      161.400      141.809
      47.193      119.500      141.809
      48.198      119.500      141.809
      49.201      105.600      141.809
      50.205      120.600      141.809
      51.208      132.600      142.066
      52.212      137.400      142.066
      53.217      134.200      142.324
      54.222      135.400      142.324
      55.226      138.400      142.324
      56.230      128.600      142.324
      57.234      127.500      142.324
      58.238      143.400      142.582
      59.242      136.500      142.840
      60.246      134.600      142.840
      61.249      145.400      142.840
      62.253      132.300      142.840
      63.259      128.400      142.840
      64.264      139.400      142.840
      65.268      138.400      142.840
      66.272      159.200      143.098
      67.278      160.200      143.098
      68.282      106.500      143.098
      69.287        0.000      143.098
      70.291        2.000      143.098
      71.295        0.000      143.098
```

### rust (async): axum + tokio postgres + bb8 (for connection pool)

```shell
./target/release/async_rust
```

```
Summary:
  Success rate:	1.0000
  Total:	60.0030 secs
  Slowest:	0.3792 secs
  Fastest:	0.0758 secs
  Average:	0.1870 secs
  Requests/sec:	267.0533

  Total data:	58.45 MiB
  Size/request:	3.73 KiB
  Size/sec:	997.51 KiB

Response time histogram:
  0.103 [22]   |
  0.131 [145]  |
  0.159 [1753] |■■■■■■■
  0.186 [7096] |■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
  0.214 [4543] |■■■■■■■■■■■■■■■■■■■■
  0.241 [1629] |■■■■■■■
  0.269 [545]  |■■
  0.296 [225]  |■
  0.324 [40]   |
  0.352 [17]   |
  0.379 [9]    |

Latency distribution:
  10% in 0.1566 secs
  25% in 0.1679 secs
  50% in 0.1820 secs
  75% in 0.2010 secs
  90% in 0.2249 secs
  95% in 0.2424 secs
  99% in 0.2794 secs

Details (average, fastest, slowest):
  DNS+dialup:	0.0353 secs, 0.0288 secs, 0.0377 secs
  DNS-lookup:	0.0000 secs, 0.0000 secs, 0.0001 secs

Status code distribution:
  [200] 16024 responses
```

perf log

```
# Elapsed time   CPU (%)     Real (MB)
       0.000        0.000       14.461
       1.004        0.000       14.461
       2.007        0.000       14.461
       3.010        4.000       14.461
       4.014       46.800       14.578
       5.018       50.800       14.578
       6.024       45.700       14.578
       7.029       38.800       14.578
       8.033       39.800       14.578
       9.037       35.900       14.578
      10.041       37.900       14.578
      11.045       37.800       14.578
      12.049       35.900       14.578
      13.053       39.800       14.578
      14.057       36.800       14.578
      15.061       38.900       14.578
      16.065       35.900       14.578
      17.068       37.900       14.578
      18.072       34.900       14.578
      19.076       36.900       14.586
      20.079       34.900       14.586
      21.083       36.900       14.586
      22.086       36.900       14.586
      23.090       37.800       14.586
      24.094       43.800       14.586
      25.098       35.900       14.586
      26.102       38.800       14.621
      27.106       50.800       14.621
      28.112       40.700       14.621
      29.117       41.800       14.621
      30.121       44.800       14.621
      31.125       38.800       14.621
      32.129       37.800       14.621
      33.133       35.900       14.621
      34.136       38.900       14.621
      35.140       40.900       14.621
      36.144       36.800       14.621
      37.148       30.900       14.629
      38.152       33.900       14.621
      39.156       35.900       14.621
      40.160       37.900       14.621
      41.163       36.900       14.621
      42.167       37.900       14.621
      43.171       33.900       14.621
      44.174       35.900       14.598
      45.178       39.900       14.598
      46.182       37.900       14.598
      47.185       37.900       14.598
      48.190       39.800       14.617
      49.193       37.900       14.617
      50.198       48.800       14.617
      51.202       52.800       14.617
      52.207       47.800       14.617
      53.212       47.800       14.625
      54.216       41.800       14.617
      55.219       37.900       14.617
      56.224       35.800       14.617
      57.227       37.900       14.617
      58.231       27.900       14.617
      59.235       30.900       14.617
      60.239       37.900       14.617
      61.242       36.900       14.617
      62.247       34.900       14.633
      63.250       26.900       14.633
      64.254        0.000       14.633
```

Also compiler errors sometimes look like:

```
error[E0277]: the trait bound `fn(Extension<Pool<PostgresConnectionManager<MakeTlsConnector>>>, CookieJar) -> impl Future<Output = Result<Json<[type error]>, (axum::http::StatusCode, std::string::String)>> {recipes_list}: Handler<_, _>` is not satisfied
   --> src/main.rs:48:39
    |
48  |         .route("/api/v1/recipes", get(recipes_list))
    |                                   --- ^^^^^^^^^^^^ the trait `Handler<_, _>` is not implemented for `fn(Extension<Pool<PostgresConnectionManager<MakeTlsConnector>>>, CookieJar) -> impl Future<Output = Result<Json<[type error]>, (axum::http::StatusCode, std::string::String)>> {recipes_list}`
    |                                   |
    |                                   required by a bound introduced by this call
    |
    = help: the trait `Handler<T, ReqBody>` is implemented for `axum::handler::Layered<S, T>`
note: required by a bound in `axum::routing::get`
   --> /Users/steve/.cargo/registry/src/github.com-1ecc6299db9ec823/axum-0.5.16/src/routing/method_routing.rs:395:1
    |
395 | top_level_handler_fn!(get, GET);
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ required by this bound in `axum::routing::get`
    = note: this error originates in the macro `top_level_handler_fn` (in Nightly builds, run with -Z macro-backtrace for more info)
```

## conclusion

| name         | RPS | peak CPU | peak memory |
| ------------ | --- | -------- | ----------- |
| sync Python  | 58  | 48%      | 276 MB      |
| async Python | 495 | 160%     | 143 MB      |
| async Rust   | 267 | 53%      | 15 MB       |

Switching from sync python to async gives us a 10x boost in RPS (58 -> 495) and we can cut our memory usage in half.

Compared to async Python, async Rust gives us a 10x decrease in memory usage (143 MB -> 15 MB) with a 2/3 decrease in peak CPU usage (160% -> 53%), but we get 45% less RPS (495 -> 267).

Overall, async python is a magnitude more efficient than sync Python and async Rust is a magnitude more efficient than async Python.

I'm guessing there is a way to get Tokio to use more of the available CPU / memory, as there are a lot more resources available on the box.

Also the [code is available on GitHub](https://github.com/sbdchd/http-showdown).
