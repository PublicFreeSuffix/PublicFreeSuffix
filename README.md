# Public Free Suffix: Free Domain Name For Everyone

**Public Free Suffix** is a non-profit, free subdomain service designed to empower various communities. We believe in providing accessible resources for:

* **Developers:** Perfect for project testing, staging environments, and personal development sandboxes.
* **Students:** Ideal for academic research, class projects, and learning new technologies without cost barriers.
* **Technicians:** An excellent resource for computer and network technology research, lab setups, and experimenting with new configurations.
* **Personal Users:** Host your personal blog, portfolio, or small passion project within our compliant framework.

Anyone can register and obtain their free domain from here and no need renew it annually. The suffixes currently providing services are as follows (sld):
```text
pfsdns.org
nastu.net
tun.re
6ti.net
no.kg
```

## Supported third-party DNS hosting platforms
A third-party DNS service hosting platform (paid/free) that has been tested and supported by users. You need to add your desired domain name to these platforms first, obtain the NS record, and then initiate the PR registration process.

[<img alt="dns.he.net" title="dns.he.net" height="40px" style="margin-right:10px" src="https://dns.he.net/include/images/helogo.gif" />](https://dns.he.net/?src=PublicFreeSuffix)
[<img alt="desec.io" title="desec.io" height="40px" style="margin-right:10px" src="https://desec.io/assets/logo-CP29ePBl.svg" />](https://desec.io/?src=PublicFreeSuffix)
[<img alt="hostry.com" title="hostry.com" height="40px" src="https://hostry.com/img/logo.svg?v=1.00r3266" />](https://hostry.com/?src=PublicFreeSuffix)

## How do I register a domain name?

[Acceptable Use Policy](agreements/acceptable-use-policy.md) | 
[Privacy Policy](agreements/privacy-policy.md) | 
[Registration And Use Agreement](agreements/registration-and-use-agreement-sokg.md) | 
[Reserved Words List](reserved_words.txt)
1. Clone the repository:
```bash
git clone https://github.com/PublicFreeSuffix/PublicFreeSuffix.git
```
Create a new branch for your own domain name:
```bash
git checkout main
git pull origin main
git checkout -b yourdomain.no.kg-request-1
```
Before performing any PR (Pull Request) operation—whether it's registering, updating, or deleting a domain's Whois file—you should always switch back to the main branch and sync the latest changes to your local environment.
Afterward, create a new branch following the specified branch naming convention. Save your changes, and then create a new PR from this new branch.
The branch naming convention should always adapt to the specific operation count, using the format: `yourdomain.no.kg-request-{a_number_here}`.

2. Choose avaliable domain name, and create a new whois file into `./whois/{your-new-domain-name}.json` folder:
```json
{
  "registrant": "your-own-example@gmail.com",
  "domain": "mynewdomain",
  "sld": "no.kg",
  "nameservers": [
    "nameserver1.example.com",
    "nameserver2.example.com",
    "nameserver3.example.com",
    "nameserver4.example.com"
  ],
  "agree_to_agreements": {
    "registration_and_use_agreement": true,
    "acceptable_use_policy": true,
    "privacy_policy": true
  }
}
```
- `registrant`: The email address of the domain owner.
- `domain`: The domain name without the top-level domain (e.g., "mynewdomain"), domain length must more than 3 chars.
- `sld`: The suffix you want to register (e.g., "no.kg" or one of SLD in list before).
- `nameservers`: A list of DNS servers responsible for resolving the domain, 2 - 4 servers are allowed.
- `agree_to_agreements`: A boolean value indicating whether the user has agreed to the registration and use agreement, acceptable use policy, and privacy policy.
- The name of this file must be `{your-new-domain-name}.json`, like `mynewdomain.no.kg.json` here.

> **Notice** In order to improve utilization and prevent hoarding of registrations and waste of resources, your registered domain name will be revoked if it is detected that no website content has been deployed within 30 consecutive days.

3. Create a pull request with your new domain name and whois file, your PR descriptions should format in [PR Description Template](.github/pull_request_template.md), and the title should format in:
```text
Registration/Update/Remove: {your-new-domain-name}.{sld}
```
A single Pull Request is only allowed to submit one domain name registration request.

4. Complete the registrant email verification according to [Automated Registrant Authorization via Email(ARAE)](AUTHORIZATION.md) description.

5. After the domain is set up, you can use it for your website or other purposes.

## How do I update my domain's NS / registrant email?
It's easy, just modify your whois file and create a new pull request, and then complete the registrant email verification again.

[<img title="Report domain abuse" src="https://i.postimg.cc/Xq7VHpLs/rebuse-log.png" height="35px" />](https://forms.gle/cXkxrKbdoeBsKBQdA)