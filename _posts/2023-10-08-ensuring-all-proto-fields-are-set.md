---
layout: post
title: "Ensuring All Proto Fields Are Set"
description: "Use the descriptor Luke"
---

## The Problem

With proto3, [every field is optional](https://stackoverflow.com/a/52360213/3720597). This can be a problem if you want to ensure you always set certain fields.

For example, if we have an RPC to send a message defined as follows:

```protobuf
syntax = "proto3";

package com.my.pkg;

service MessageService {
  rpc SendMessage(MessageRequest) returns (MessageResponse);
}

message MessageRequest {
  string body = 1;
  string from = 2;
  string to = 3;
}

message MessageResponse {
  string id = 1;
}
```

And we call it using Java:

```java
import com.my.pkg.MessageRequest;

public class Main {
    public static void main(String[] args) {
        var client = new Client();
        var msg = MessageRequest.newBuilder()
            .setBody("hello world")
            .setFrom("+15085550000")
            .build();
        var res = client.sendMessage(msg);
        System.out.println("res", res);
    }
}
```

We then compile our code, run our linters, which both pass without any problems.

Then when we run it, we'll end up with an error because we forgot to set the `to` field on the message!

Bummer.

## Fixing it manually

One option is to write some code to validate the message before we send it over the wire.

```java
import com.my.pkg.MessageRequest;

public class Main {
    public static void main(String[] args) {
        var client = new Client();
        var msg = MessageRequest.newBuilder()
            .setBody("hello world")
            .setFrom("+15085550000")
            .build();

        for (var field : msg.getDescriptorForType().getFields()) {
            if (!msg.hasField(field)) {
                throw new RuntimeException("expected field to be set");
            }
        }

        var res = client.sendMessage(msg);
        System.out.println("res", res);
    }
}
```

This sort of works, we could also even use [Mockito and ArgumentCaptor](https://site.mockito.org/javadoc/current/org/mockito/ArgumentCaptor.html) to avoid running the check at runtime, but this still doesn't handle cases like `repeated` fields or nested messages.

## Fixing it with Protovalidate

Instead of inventing our own validation logic on top of protobufs, we could use the existing [protovalidate](https://github.com/bufbuild/protovalidate) package.

So instead our proto and code would look as follows:

```protobuf
syntax = "proto3";

package com.my.pkg;

service MessageService {
  rpc SendMessage(MessageRequest) returns (MessageResponse);
}

message MessageRequest {
  string body = 1 [(buf.validate.field).required = true];
  string from = 2 [(buf.validate.field).string = {
    min_len: 1;
    max_len: 15;
  }];
  string to = 3 [(buf.validate.field).string = {
    min_len: 1;
    max_len: 15;
  }];
}

message MessageResponse {
  string id = 1;
}
```

```java
package com.my.pkg;

import build.buf.protovalidate.results.ValidationException;

import com.my.pkg.MessageRequest;

public class Main {
    public static void main(String[] args) {
        var client = new Client();
        var msg = MessageRequest.newBuilder()
            .setBody("hello world")
            .setFrom("+15085550000")
            .build();

        var validator = new Validator();
        try {
            var result = validator.validate(transaction);
            if (!result.violations.isEmpty()) {
                System.out.println(result.toString());
                System.exit(1);
            }
        } catch (ValidationException e) {
            System.out.println("Validation failed: " + e.getMessage());
            System.exit(1);
        }

        var res = client.sendMessage(msg);
        System.out.println("res " + res.getId());
    }
}
```

## Conclusion

Checkout [protovalidate](https://github.com/bufbuild/protovalidate) to help validate your protos!
