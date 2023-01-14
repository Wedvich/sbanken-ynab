import { rest } from 'msw';

export const handlers = [
  rest.get('https://api.youneedabudget.com/v1/budgets/:budgetId/transactions', (req, res, ctx) => {
    if (!req.headers.has('Authorization')) {
      return res(
        ctx.status(401),
        ctx.json({
          error: {
            id: 'string',
            name: 'string',
            detail: 'string',
          },
        })
      );
    }

    return res(
      ctx.json({
        data: {
          transactions: [
            {
              id: 'string',
              date: 'string',
              amount: 0,
              memo: 'string',
              cleared: 'cleared',
              approved: true,
              flag_color: 'red',
              account_id: 'string',
              payee_id: 'string',
              category_id: 'string',
              transfer_account_id: 'string',
              transfer_transaction_id: 'string',
              matched_transaction_id: 'string',
              import_id: 'string',
              import_payee_name: 'string',
              import_payee_name_original: 'string',
              deleted: true,
              account_name: 'string',
              payee_name: 'string',
              category_name: 'string',
              subtransactions: [
                {
                  id: 'string',
                  transaction_id: 'string',
                  amount: 0,
                  memo: 'string',
                  payee_id: 'string',
                  payee_name: 'string',
                  category_id: 'string',
                  category_name: 'string',
                  transfer_account_id: 'string',
                  transfer_transaction_id: 'string',
                  deleted: true,
                },
              ],
            },
          ],
          server_knowledge: 123,
        },
      })
    );
  }),
];
