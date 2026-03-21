---
layout: post
title: "LSP Types & Rust"
description: "Using the Type System"
last_modified_at: 2026-03-21
---

[Squawk's](https://squawkhq.com) [language server](https://github.com/sbdchd/squawk/tree/1a3f6bd70fb2ddf3caa66b604d15e5314591277d/crates/squawk_server) uses [lsp-types](https://crates.io/crates/lsp-types), which provides serde-friendly types for the Language Server Protocol (LSP). This avoids us having to implement a lot of boilerplate.

## Before: A Manual Approach

One of the provided types is `SelectionRangeRequest`, which is used for expanding and shrinking selections in editors. It's defined in `lsp-types` as:

```rust
pub enum SelectionRangeRequest {}

impl Request for SelectionRangeRequest {
    type Params = SelectionRangeParams;
    type Result = Option<Vec<SelectionRange>>;
    const METHOD: &'static str = "textDocument/selectionRange";
}
```

This type has the parameters, return type, and method name included in it.

Originally Squawk handled this request in the server as:

```rust
match req.method.as_ref() {
    SelectionRangeRequest::METHOD => {
        handle_selection_range(&connection, req, &system)?;
    }
    _ => (),
}

fn handle_selection_range(
    connection: &Connection,
    req: lsp_server::Request,
    system: &impl System,
) -> Result<()> {
    let params: SelectionRangeParams = serde_json::from_value(req.params)?;
    let uri = params.text_document.uri;

    let selection_ranges = todo!();

    let resp = Response {
        id: req.id,
        result: Some(serde_json::to_value(&selection_ranges).unwrap()),
        error: None,
    };
    connection.sender.send(Message::Response(resp))?;
    Ok(())
}
```

This is okay, but we're parsing the params in the function and also serializing the result in the function.

The function's params and return type don't actually tell us anything about what it expects for input and output.

## After: Use the Types

Instead, we can look to [rust-analyzer's approach](https://github.com/rust-lang/rust-analyzer/blob/2efc80078029894eec0699f62ec8d5c1a56af763/crates/rust-analyzer/src/handlers/dispatch.rs#L277C5-L277C5).

```rust
RequestDispatcher::new(&connection, req, &system)
    .on::<SelectionRangeRequest>(handle_selection_range)?
    .finish();


fn handle_selection_range(
    system: &dyn System,
    params: SelectionRangeParams,
) -> Result<Option<Vec<lsp_types::SelectionRange>>> {
    let uri = params.text_document.uri;

    let selection_ranges = todo!();

    Ok(Some(selection_ranges))
}
```

Inside `RequestDispatcher`, the key methods are `parse` and `on`.

### Parse

Since `SelectionRangeRequest` implements `Request`:

```rust
pub trait Request {
    type Params: DeserializeOwned + Serialize + Send + Sync + 'static;
    type Result: DeserializeOwned + Serialize + Send + Sync + 'static;
    const METHOD: &'static str;
}
```

We can extract the `Params` type from it along with the `METHOD` `const` and use those in our `parse` method.

```rust
fn parse<R>(&mut self) -> Option<(lsp_server::RequestId, R::Params)>
where
    R: Request,
{
    let req = self.req.take_if(|req| req.method.as_str() == R::METHOD)?;
    let id = req.id.clone();

    match req.extract(R::METHOD) {
        Ok((id, params)) => Some((id, params)),
        Err(err) => {
            let response = Response::new_err(
                id,
                lsp_server::ErrorCode::ParseError as i32,
                err.to_string(),
            );
            if let Err(err) = self.connection.sender.send(Message::Response(response)) {
                error!("Failed to send parse error response: {err}");
            }
            None
        }
    }
}
```

### On

With the `on` method we do something similar, extracting the `Params` and `Result` types, giving us statically typed handlers.

```rust
fn on<R>(
    mut self,
    handler: fn(&dyn System, R::Params) -> Result<R::Result>,
) -> Result<Self>
where
    R: Request,
{
    if let Some((id, params)) = self.parse::<R>() {
        let resp = match handler(self.system, params) {
            Ok(result) => Response::new_ok(id, result),
            Err(err) => {
                error!("Request handler failed: {err}");
                Response::new_err(
                    id,
                    lsp_server::ErrorCode::InternalError as i32,
                    err.to_string(),
                )
            }
        };
        self.connection.sender.send(Message::Response(resp))?;
    }

    Ok(self)
}
```

We're also now properly handling errors from the handler. Before we'd bubble up the error to the top of the program and exit. Now we return an LSP error response.

Importantly, the handlers no longer have to parse and serialize the types. They can have well typed param and return types.

## Conclusion

Rust's type system lets us simplify our code with type-safe abstractions.
