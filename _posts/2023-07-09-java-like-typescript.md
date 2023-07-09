---
layout: post
title: "Writing Java like TypeScript"
description: "Embracing var"
---

In Java, the common style is to explicitly type every variable declaration.

So you'll see things like:

```java
String content = "some string content";
```

Which is surprising coming from more dynamic lands (Python, Ruby, TypeScript) or more modern static languages (Rust).

[As of Java 10](https://docs.oracle.com/en/java/javase/20/language/local-variable-type-inference.html#GUID-D2C58FE6-1065-4B50-9326-57DD8EC358AC), the language has `var` which allows for omitting the explicit type.

There's even a [rule in errorprone](https://errorprone.info/bugpattern/Varifier)[ to prefer using `var`](https://github.com/google/error-prone/blob/15e8e01b26c283433cf0b514730683efe42a7b80/core/src/main/java/com/google/errorprone/bugpatterns/Varifier.java)[ in some cases](https://github.com/google/error-prone/blob/15e8e01b26c283433cf0b514730683efe42a7b80/core/src/main/java/com/google/errorprone/bugpatterns/UnusedVariable.java).

But ultimately I don't think errorprone rule goes far enough, it warns about boilerplate usages like:

```java
CustomerCreateParams params =
    CustomerCreateParams
        .builder()
        .setDescription("Example description")
        .setEmail("test@example.com")
        .setPaymentMethod("pm_card_visa")
        .build();
```

but doesn't warn about:

```java
String foo = "foo";
```

Instead, I think `var` should be preferred whenever possible, providing Java with readability similar to TypeScript.

So instead of:

```java
String foo = "foo";
List<Character> charList = new ArrayList<>();
for (char c : foo.toCharArray()) {
    System.out.println(c);
    charList.add(c);
}
```

we'd have:

```java
var foo = "foo";
var charList = new ArrayList<Character>();
for (var c : foo.toCharArray()) {
    System.out.println(c);
    charList.add(c);
}
System.out.println(charList.size());
```
