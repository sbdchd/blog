---
layout: post
title: Problems Debugging iOS Safari from Mac
description: "ERROR: invalid input syntax for type inet"
---

After setting up the proper permissions, running the Mac Safari debugger on a tab
running in iOS Safari is as easy as navigating to the `Develop` menu and
clicking the iOS device and selecting the tab you want to inspect.

Anyways, when loading up a project running on your Mac you might hit this error:

```
Invalid Host header
```

Now if you dig around long enough you'll find out that the webpack dev server
[is sending this response](https://github.com/webpack/webpack-dev-server/blob/f1246c766c19c625175e8f1c2ac0fe50a71b1dc9/lib/Server.js#L165-L171):


```js
app.all('*', (req, res, next) => {
  if (this.checkHost(req.headers)) {
    return next();
  }

  res.send('Invalid Host header');
});
```

So we need to update `checkHost` to allow iOS Safari to access the field.

We can use the `disableHostCheck` option, which disables the check entirely, a
little risky, or add the iOS device to the `allowedHosts`, easy enough.

```diff
diff --git a/frontend/scripts/start.js b/frontend/scripts/start.js
index 0159f5a..1937917 100644
--- a/frontend/scripts/start.js
+++ b/frontend/scripts/start.js
@@ -317,6 +317,7 @@ function runDevServer(host, port, protocol) {
     https: protocol === "https",
     host,
+    allowedHosts: ["otter.local"]
   })

   // Our custom middleware proxies requests to /index.html or a remote API.
```

After a restart of the frontend server, iOS Safari can now load the page.

Then when trying to login, the django backend throws an error:

```
[10/Apr/2022 02:43:57] "POST /api/v1/auth/login/ HTTP/1.1" 500 169800
level=INFO msg="Login by user@example.com" user_id=1 request_id=7dbdf460-986a-47f1-84f6-756377e2c7e7 name=core.auth.views pathname="/backend/core/auth/views.py" lineno=69 funcname=post process=22783 thread=123145578180608
Internal Server Error: /api/v1/auth/login/
Traceback (most recent call last):
  File "/backend/.venv/lib/python3.7/site-packages/django/db/backends/utils.py", line 84, in _execute
    return self.cursor.execute(sql, params)
psycopg2.errors.InvalidTextRepresentation: invalid input syntax for type inet: "fe80::1c0d:c874:ae30:74ae%en0"
LINE 1: ...04-10T03:11:20.316332+00:00'::timestamptz, "ip" = 'fe80::1c0...
                                                             ^


The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "/backend/.venv/lib/python3.7/site-packages/django/core/handlers/exception.py", line 47, in inner
    response = get_response(request)
  File "/backend/.venv/lib/python3.7/site-packages/sentry_sdk/integrations/django/middleware.py", line 175, in __call__
    return f(*args, **kwargs)
  File "/backend/.venv/lib/python3.7/site-packages/django/utils/deprecation.py", line 119, in __call__
    response = self.process_response(request, response)
  File "/backend/.venv/lib/python3.7/site-packages/django/contrib/sessions/middleware.py", line 61, in process_response
    request.session.save()
  File "/backend/.venv/lib/python3.7/site-packages/user_sessions/backends/db.py", line 83, in save
    obj.save(force_insert=must_create, using=using)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/models/base.py", line 727, in save
    force_update=force_update, update_fields=update_fields)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/models/base.py", line 765, in save_base
    force_update, using, update_fields,
  File "/backend/.venv/lib/python3.7/site-packages/django/db/models/base.py", line 846, in _save_table
    forced_update)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/models/base.py", line 899, in _do_update
    return filtered._update(values) > 0
  File "/backend/.venv/lib/python3.7/site-packages/django/db/models/query.py", line 802, in _update
    return query.get_compiler(self.db).execute_sql(CURSOR)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/models/sql/compiler.py", line 1559, in execute_sql
    cursor = super().execute_sql(result_type)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/models/sql/compiler.py", line 1175, in execute_sql
    cursor.execute(sql, params)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/backends/utils.py", line 98, in execute
    return super().execute(sql, params)
  File "/backend/.venv/lib/python3.7/site-packages/sentry_sdk/integrations/django/__init__.py", line 508, in execute
    return real_execute(self, sql, params)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/backends/utils.py", line 66, in execute
    return self._execute_with_wrappers(sql, params, many=False, executor=self._execute)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/backends/utils.py", line 75, in _execute_with_wrappers
    return executor(sql, params, many, context)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/backends/utils.py", line 84, in _execute
    return self.cursor.execute(sql, params)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/utils.py", line 90, in __exit__
    raise dj_exc_value.with_traceback(traceback) from exc_value
  File "/backend/.venv/lib/python3.7/site-packages/django/db/backends/utils.py", line 84, in _execute
    return self.cursor.execute(sql, params)
django.db.utils.DataError: invalid input syntax for type inet: "fe80::1c0d:c874:ae30:74ae%en0"
LINE 1: ...04-10T03:11:20.316332+00:00'::timestamptz, "ip" = 'fe80::1c0...
                                                             ^

level=ERROR msg="Internal Server Error: /api/v1/auth/login/" user_id=1 request_id=7dbdf460-986a-47f1-84f6-756377e2c7e7 name=django.request pathname="/backend/.venv/lib/python3.7/site-packages/django/utils/log.py" lineno=230 funcname=log_response process=22783 thread=123145578180608
Traceback (most recent call last):
  File "/backend/.venv/lib/python3.7/site-packages/django/db/backends/utils.py", line 84, in _execute
    return self.cursor.execute(sql, params)
psycopg2.errors.InvalidTextRepresentation: invalid input syntax for type inet: "fe80::1c0d:c874:ae30:74ae%en0"
LINE 1: ...04-10T03:11:20.316332+00:00'::timestamptz, "ip" = 'fe80::1c0...
                                                             ^


The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "/backend/.venv/lib/python3.7/site-packages/django/core/handlers/exception.py", line 47, in inner
    response = get_response(request)
  File "/backend/.venv/lib/python3.7/site-packages/sentry_sdk/integrations/django/middleware.py", line 175, in __call__
    return f(*args, **kwargs)
  File "/backend/.venv/lib/python3.7/site-packages/django/utils/deprecation.py", line 119, in __call__
    response = self.process_response(request, response)
  File "/backend/.venv/lib/python3.7/site-packages/django/contrib/sessions/middleware.py", line 61, in process_response
    request.session.save()
  File "/backend/.venv/lib/python3.7/site-packages/user_sessions/backends/db.py", line 83, in save
    obj.save(force_insert=must_create, using=using)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/models/base.py", line 727, in save
    force_update=force_update, update_fields=update_fields)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/models/base.py", line 765, in save_base
    force_update, using, update_fields,
  File "/backend/.venv/lib/python3.7/site-packages/django/db/models/base.py", line 846, in _save_table
    forced_update)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/models/base.py", line 899, in _do_update
    return filtered._update(values) > 0
  File "/backend/.venv/lib/python3.7/site-packages/django/db/models/query.py", line 802, in _update
    return query.get_compiler(self.db).execute_sql(CURSOR)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/models/sql/compiler.py", line 1559, in execute_sql
    cursor = super().execute_sql(result_type)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/models/sql/compiler.py", line 1175, in execute_sql
    cursor.execute(sql, params)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/backends/utils.py", line 98, in execute
    return super().execute(sql, params)
  File "/backend/.venv/lib/python3.7/site-packages/sentry_sdk/integrations/django/__init__.py", line 508, in execute
    return real_execute(self, sql, params)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/backends/utils.py", line 66, in execute
    return self._execute_with_wrappers(sql, params, many=False, executor=self._execute)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/backends/utils.py", line 75, in _execute_with_wrappers
    return executor(sql, params, many, context)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/backends/utils.py", line 84, in _execute
    return self.cursor.execute(sql, params)
  File "/backend/.venv/lib/python3.7/site-packages/django/db/utils.py", line 90, in __exit__
    raise dj_exc_value.with_traceback(traceback) from exc_value
  File "/backend/.venv/lib/python3.7/site-packages/django/db/backends/utils.py", line 84, in _execute
    return self.cursor.execute(sql, params)
django.db.utils.DataError: invalid input syntax for type inet: "fe80::1c0d:c874:ae30:74ae%en0"
LINE 1: ...04-10T03:11:20.316332+00:00'::timestamptz, "ip" = 'fe80::1c0...
```

Tailing the postgres logs after [enabling logging of all
statements](https://stackoverflow.com/q/722221/3720597) gives us:

```
tail -f "~/Library/Application Support/Postgres/var-10/pg_log/postgresql.log"
```

```
2022-04-09 23:11:20.318 EDT [2545] LOG:  statement: BEGIN
2022-04-09 23:11:20.319 EDT [2545] LOG:  statement: UPDATE "user_sessions_session" SET "session_data" = '.eJxVjMsOwiAQRf-FtSHA8HTp3m8gAwNSNTQp7cr479qkC93ec859sYjb2uI2yhInYmcm2el3S5gfpe-A7thvM89zX5cp8V3hBx38OlN5Xg7376DhaN_agHMVg85KAXifEwV0WCwJbcEQhEQyC6e9yN6KqkK1psoAporknCH2_gDSSjdX:1ndNyy:5IK9ioBIcecKt0URwDpT1t9iM-m361rZOwwq9Bw5e0M', "expire_date" = '2023-04-10T03:11:20.315644+00:00'::timestamptz, "user_id" = 1, "user_agent" = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1', "last_activity" = '2022-04-10T03:11:20.316332+00:00'::timestamptz, "ip" = 'fe80::1c0d:c874:ae30:74ae%en0'::inet WHERE "user_sessions_session"."session_key" = 'wjtnphxcc04rc5ddi9a82u6jegjisz8o'
2022-04-09 23:11:20.320 EDT [2545] ERROR:  invalid input syntax for type inet: "fe80::1c0d:c874:ae30:74ae%en0" at character 595
2022-04-09 23:11:20.320 EDT [2545] STATEMENT:  UPDATE "user_sessions_session" SET "session_data" = '.eJxVjMsOwiAQRf-FtSHA8HTp3m8gAwNSNTQp7cr479qkC93ec859sYjb2uI2yhInYmcm2el3S5gfpe-A7thvM89zX5cp8V3hBx38OlN5Xg7376DhaN_agHMVg85KAXifEwV0WCwJbcEQhEQyC6e9yN6KqkK1psoAporknCH2_gDSSjdX:1ndNyy:5IK9ioBIcecKt0URwDpT1t9iM-m361rZOwwq9Bw5e0M', "expire_date" = '2023-04-10T03:11:20.315644+00:00'::timestamptz, "user_id" = 1, "user_agent" = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1', "last_activity" = '2022-04-10T03:11:20.316332+00:00'::timestamptz, "ip" = 'fe80::1c0d:c874:ae30:74ae%en0'::inet WHERE "user_sessions_session"."session_key" = 'wjtnphxcc04rc5ddi9a82u6jegjisz8o'
2022-04-09 23:11:20.322 EDT [2545] LOG:  statement: ROLLBACK
```

If we run the query in question through a formatter we get:


```sql
UPDATE
  "user_sessions_session"
SET
  "session_data" = '.eJxVjMsOwiAQRf-FtSHA8HTp3m8gAwNSNTQp7cr479qkC93ec859sYjb2uI2yhInYmcm2el3S5gfpe-A7thvM89zX5cp8V3hBx38OlN5Xg7376DhaN_agHMVg85KAXifEwV0WCwJbcEQhEQyC6e9yN6KqkK1psoAporknCH2_gDSSjdX:1ndNyy:5IK9ioBIcecKt0URwDpT1t9iM-m361rZOwwq9Bw5e0M',
  "expire_date" = '2023-04-10T03:11:20.315644+00:00'::timestamptz,
  "user_id" = 1,
  "user_agent" = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
  "last_activity" = '2022-04-10T03:11:20.316332+00:00'::timestamptz,
  "ip" = 'fe80::1c0d:c874:ae30:74ae%en0'::inet
WHERE
  "user_sessions_session"."session_key" = 'wjtnphxcc04rc5ddi9a82u6jegjisz8o'
```

And if we look at the error, postgres is complaining about the ip being malformed:

```sql
select 'fe80::1c0d:c874:ae30:74ae%en0'::inet
```

gives us the same error:

```
Query 1 ERROR: ERROR:  invalid input syntax for type inet: "fe80::1c0d:c874:ae30:74ae%en0"
LINE 1: select 'fe80::1c0d:c874:ae30:74ae%en0'::inet;
```

Clearly `%en0` at the end of the ip shouldn't be there.


Messing around in `pdb`, we can see the WSGI headers Django is using:

```python
{
    "Content-Length": "100",
    "Content-Type": "application/json;charset=utf-8",
    "X-Forwarded-Host": "otter.local:3000",
    "X-Forwarded-Proto": "http",
    "X-Forwarded-Port": "3000",
    "X-Forwarded-For": "fe80::1c0d:c874:ae30:74ae%en0",
    "Cookie": "sessionid=wjtnphxcc04rc5ddi9a82u6jegjisz8o",
    "Referer": "http://otter.local:3000/login",
    "Connection": "close",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1",
    "Origin": "http://localhost:8000",
    "X-Request-Id": "ee972eaa-1f59-41c6-8473-b4bf7d898517",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "application/json, text/plain, */*",
    "Host": "localhost:8000",
}
```


So the weird IP is originating further upstream, checking the network devices:


```
ifconfig
```

we can see that `en0` is setup with the ip in question:


```
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
        options=400<CHANNEL_IO>
        ether ac:bc:32:7b:0f:67
        inet6 fe80::97:2a3d:d7b4:85ac%en0 prefixlen 64 secured scopeid 0x4
        inet 192.168.99.26 netmask 0xffffff00 broadcast 192.168.99.255
        nd6 options=201<PERFORMNUD,DAD>
        media: autoselect
        status: active
```


Looking in `man ifconfig`, `prefixlen` is normal:

```
prefixlen len
  (Inet6 only.)  Specify that len bits are reserved for subdividing networks into
  sub-networks.  The len must be integer, and for syntactical reason it must be
  between 0 to 128.  It is almost always 64 under the current IPv6 assignment
  rule.  If the parameter is omitted, 64 is used.

  The prefix can also be specified using the slash notation after the address.
  See the address option above for more information.
```

`scopeid` is no where to be found in the `man` page, but looks suspect with `0x4` being the length of `%en0`.

A little googling, and we end up at
<https://networkengineering.stackexchange.com/a/46657/43747> which describes the
`%en0` stuff at the end of the ip as [link local addressing](https://en.wikipedia.org/wiki/Link-local_address#IPv6) and points to the
<https://www.rfc-editor.org/rfc/rfc6874> (2013) which itself references
<https://www.rfc-editor.org/rfc/rfc4007> (2005) which defines the IPv6 Scoped
Addresses syntax:

```
11.  Textual Representation

   As already mentioned, to specify an IPv6 non-global address without
   ambiguity, an intended scope zone should be specified as well.  As a
   common notation to specify the scope zone, an implementation SHOULD
   support the following format:

            <address>%<zone_id>

   where

      <address> is a literal IPv6 address,

      <zone_id> is a string identifying the zone of the address, and

      `%' is a delimiter character to distinguish between <address> and
      <zone_id>.
```


So, when connecting to an iOS device, the Mac uses an IPv6 link local IP
address with a zone id.


## The Fix


Django sessions don't include an ip address field, but this project uses a [third
party library for sessions that
does](https://pypi.org/project/django-user-sessions/). With a quick hack, we
can get things working again:

```diff
diff --git a/user_sessions/backends/db.py b/user_sessions/backends/db.py
index 4c02f2c..db4af6d 100644
--- a/user_sessions/backends/db.py
+++ b/user_sessions/backends/db.py
@@ -16,6 +16,8 @@ class SessionStore(SessionBase):
         super(SessionStore, self).__init__(session_key)
         # Truncate user_agent string to max_length of the CharField
         self.user_agent = user_agent[:200] if user_agent else user_agent
+        if ip.endswith("%en0"):
+            ip = ip[:len(ip) - len("%en0")]
         self.ip = ip
         self.user_id = None
```
