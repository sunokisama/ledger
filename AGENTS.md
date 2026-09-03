# Repository guidance

- Preserve original transaction amounts and currencies; never replace them with converted values.
- Store money as integer minor units and exchange rates as high-precision decimals.
- Keep JPY and CNY balances separate. Treat exchange as a transfer, not income or expense.
- A sale may consume part of a purchase batch; update remaining quantity atomically.
- A transaction may allocate across multiple exchange batches under FIFO.
- Scope every database read and write to the authenticated user.
- Run `npm run build` after source changes and generate a migration after schema changes.
- Do not require start/end dates on trip cycles.
- Dialogs with unsaved input must not close on backdrop click.
