using System.Collections;
using Microsoft.AspNetCore.Mvc;

namespace Sby.MockApi.Controllers
{
    [ApiController, Route("ynab")]
    public class YnabController : ControllerBase
    {
        [HttpGet, Route("api/budgets")]
        public IActionResult Budgets() {
            return Ok(new {
                data = new {
                    budgets = new ArrayList
                    {
                        new
                        {
                            id = "cce56534-fb80-4611-8d30-964eafc2c5d5",
                            name = "Mock budget",
                            accounts = new ArrayList {}
                        }
                    }
                }
            });
        }

        [HttpGet, Route("api/budgets/{budgetId}/accounts")]
        public IActionResult Accounts() {
            return Ok(new {
                data = new {
                    server_knowledge = 0,
                    accounts = new ArrayList
                    {
                        new
                        {
                            id = "3a787c3d-7740-40a2-9582-ae9be3be397a",
                            name = "Lønn",
                            type = "checking",
                            balance = 0,
                            cleared_balance = 0,
                            uncleared_balance = 0
                        },
                        new
                        {
                            id = "5975871b-bdf4-4eed-8139-2fbffe4abc66",
                            name = "Forbruk",
                            type = "savings",
                            balance = 453270,
                            cleared_balance = 453270,
                            uncleared_balance = 0
                        },
                        new
                        {
                            id = "2ef29bad-0762-420c-a09f-1bdf54ccc574",
                            name = "Sparing",
                            type = "savings",
                            balance = 44798110,
                            cleared_balance = 44798110,
                            uncleared_balance = 0
                        },
                        new
                        {
                            id = "2393bc42-6dbe-41a8-91c0-1b23f747470c",
                            name = "Kredittkort 1",
                            type = "creditCard",
                            balance = -1721370,
                            cleared_balance = -1721370,
                            uncleared_balance = 0
                        },
                        new
                        {
                            id = "78830ba0-7544-4699-921e-359ac30ddb4c",
                            name = "Kredittkort 2",
                            type = "creditCard",
                            balance = -28637880,
                            cleared_balance = -28637880,
                            uncleared_balance = 0
                        }
                    }
                }
            });
        }

        [HttpGet, Route("api/budgets/{budgetId}/accounts/{accountId}/transactions")]
        public IActionResult Transactions() => Ok(new
        {
            data = new
            {
                serverKnowledge = 0,
                transactions = new ArrayList {}
            }
        });
    }
}
