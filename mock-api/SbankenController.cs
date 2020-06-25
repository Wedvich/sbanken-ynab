using System.Collections;
using Microsoft.AspNetCore.Mvc;

namespace Sby.MockApi.Controllers
{
    [ApiController, Route("sbanken")]
    public class SbankenController : ControllerBase
    {
        [HttpPost, Route("identity/token")]
        public IActionResult Token() => Ok(new
        {
            access_token = "e30.e30.123",
            expires_in = 3600,
            token_type = "Bearer",
            scope = "Exec.Bank.Accounts.read_access Exec.Bank.Transactions.read_access"
        });

        [HttpGet, Route("api/accounts")]
        public IActionResult Accounts() => Ok(new
        {
            availableItems = 0,
            items = new ArrayList
            {
                new
                {
                    accountId = "67C592B6CD974F8DAC4A6BF65EEF681E",
                    name = "Lønnskonto",
                    accountType = "Standard account",
                    creditLimit = 0,
                    balance = 31811.53,
                    available = 31811.53
                },
                new
                {
                    accountId = "B590608195DB424AA5362CE52E2F7E08",
                    name = "Brukskonto",
                    accountType = "Standard account",
                    creditLimit = 0,
                    balance = 895.24,
                    available = 453.27
                },
                new
                {
                    accountId = "7F1ACC3086204A0BADADEF3C0501923A",
                    name = "Sparekonto",
                    accountType = "Standard account",
                    creditLimit = 0,
                    balance = 44798.11,
                    available = 44798.11
                },
                new
                {
                    accountId = "1B63D125E4F14223AFA4F2FE1EDC6E84",
                    name = "VISA KREDITTKORT",
                    accountType = "Creditcard account",
                    creditLimit = 35000,
                    balance = 0,
                    available = 35000 - 1721.37
                },
                new
                {
                    accountId = "31E44B4167E34C3F8DFDB8B2AEC19F42",
                    name = "VISA KREDITTKORT",
                    accountType = "Creditcard account",
                    creditLimit = 90000,
                    balance = -28637.88,
                    available = 90000 - 28637.88
                }
            }
        });

        [HttpGet, Route("api/transactions/{accountId}")]
        public IActionResult Transactions() => Ok(new
        {
            availableItems = 0,
            items = new ArrayList {}
        });
    }
}
