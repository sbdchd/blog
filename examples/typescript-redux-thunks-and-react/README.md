# Typescript Redux, Thunks, and React

This is an example project demonstrating the issues with redux-thunks and
TypeScript.

- `src/index.tsx` general selector component
- `src/index.tsx` mock http client

example apps

- `src/no-thunks.tsx` – plain functions for async calls, type safe
- `src/redux-thunks.tsx` – redux thunk, type errors but actually works
- `src/redux-sagas.tsx` – redux sagas, works fine
- `src/redux-observables.tsx` – redux observables, also works fine


## Dev

```shell
yarn start

yarn typecheck

yarn lint

yarn format
```
