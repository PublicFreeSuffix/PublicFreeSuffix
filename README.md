# Public Free Suffix: Free Domain Names For Everyone

**Public Free Suffix** is a non-profit free subdomain service with an education-first mission, built and run by the community since January 1, 2025. It gives developers, students, technicians, and personal users free names for hands-on learning and research: domains, DNS, web servers, email servers, HTTP/HTTPS, SSL/TLS, a blog, a portfolio, a lab, or a weekend experiment. No annual fees, ever. Already own a domain? Turn it into a public suffix with [BYOS](#bring-your-own-suffix-byos).

[Website](https://publicfreesuffix.org) · [Domain console](https://s.eus/domains) · [SEUS Community](https://s.eus) · [Blog](https://publicfreesuffix.org/blog) · [Report abuse](https://s.eus/report)

## How to apply

Everything runs through the [domain console](https://s.eus/domains): no pull requests, and no waiting on email verification. From search to a resolving name takes minutes.

1. **Check availability.** Search your name in the [domain console](https://s.eus/domains) and see if it is free, instantly. Pick any of the seven live suffixes.
2. **Create your SEUS account** in the [console](https://s.eus/domains/register) and verify your GitHub account. Your GitHub account must be at least 2 years old; verification keeps the zone safe for everyone.
3. **Register and resolve on SEUS DNS.** Claim the name and it lands on SEUS DNS, our global resolution service: A, AAAA, MX, NS, CAA, TXT, CNAME, ALIAS, HTTPS, and more, all managed in the same console. No third-party DNS setup, nothing to delegate.
4. **Deploy and keep it alive.** Point the name at something real: a blog, a project page, or anything in between. Domains left empty for 30 consecutive days are reclaimed, so names go to people who actually use them.

## Supported suffixes

Seven live zones. One label under any suffix, while names last.

| Suffix | Good for |
| --- | --- |
| `fs.kg` | The project's namesake: FS reads as **Free Suffix**. A rare two-letter ending under .kg, short and on brand for anything you build |
| `bg5.net` | A familiar, stable .net ending that works for any project |
| `is-a.si` | Reads as "is a SI": Super Intelligence is spelled into the ending, and it carries AI and SI alike. A natural home for AI-driven projects, and a classic for personal "I am" pages |
| `nastu.net` | A community favourite for labs, bots, and weekend experiments |
| `tun.re` | Short and memorable: URL forwarders, tunnels, and quick demos |
| `us.mw` | Compact and memorable, with plenty of good names still up for grabs |
| `pfsdns.org` | The project home zone, operated on our own nameservers. Solid, boring, and dependable by design |

The machine-readable suffix list, including offline zones, lives in [public_sld_list.json](public_sld_list.json).

## Bring Your Own Suffix (BYOS)

Own a registered domain? Turn it into a public suffix. BYOS connects a second-level domain you own to our infrastructure so that anyone eligible can register third-level names under it through the same console. You keep full registrar ownership; we run the DNS hosting and the registration program. We are not a registrar or a registry for your domain: renewal obligations stay between you and your registrar.

### For suffix owners

- **Eligibility.** Identity verification Level 2 or above, and a two-label second-level domain under an IANA root-zone TLD. Composite public suffixes (like `co.uk`), internationalized domain names, and domains already onboarded by another account are not supported.
- **Validity.** At least two years of remaining validity when the application enters review, kept that way by timely renewals. Below two years the suffix enters a hold state: new registrations and renewals pause, while existing records keep resolving.
- **Application fee.** A one-time 2,500 community points (TGC), automatically refunded if the application is not approved; consumed once approved.
- **Delegation.** Point your domain's nameservers to ours within the 72-hour verification window, or the application expires and the reserved zone is released.
- **Your controls.** Shared or private visibility, minimum and maximum label length, a per-user registration quota, registration pricing within published limits, and a switch to pause new registrations.
- **Your duties.** First-line response to abuse under your suffix, accurate contact information on the registration page, no repointing away from our nameservers while active, and no unilateral exit while sub-domains are registered: we arrange a safe exit together through the Meta Board.
- **Limitations.** Applications pass a manual review with a stated reason on rejection, and DNSSEC is not supported for BYOS suffixes at present.
- Full terms: [BYOS SLD Onboarding Agreement](agreements/byos-onboarding-agreement.md).

### For everyone registering under a BYOS suffix

A BYOS suffix lives on a domain owned by a third party, not by the project. The suffix owner can pause registrations, adjust settings, or lose their domain; the platform can likewise pause or terminate a suffix for abuse, legal, or operational reasons. Any of these can leave your sub-domain unresolved, without compensation, so keep anything critical off BYOS names. Registration may cost community points (TGC) priced by the suffix owner within platform limits. Full terms: [BYOS Suffix Sub-domain Registration Agreement](agreements/byos-subdomain-registration-agreement.md).

## Deploy anywhere

Every platform starts the same way: one record in the console. Cloudflare Workers and Pages, Vercel, Netlify, GitHub Pages, Firebase Hosting, or the box under your desk: if it takes a DNS record, it works. ALIAS and HTTPS support makes apex setups easy too.

No hardware yet? [SEUS Light Servers](https://publicfreesuffix.org/blog/introducing-seus-light-servers/) give every active community member a free IPv6-only Linux box, one shared vCPU, 512 MB of memory, 5 GB of disk, and a real IPv6 address, for learning Linux, networking, and containers. Request yours at [s.eus/shift/create](https://s.eus/shift/create).

## The fine print

- A domain is a single label under the suffix: `myname.is-a.si` works, `my.name.is-a.si` does not.
- The name must not hit the [reserved words list](reserved_words.txt); standard trademark rules apply.
- By registering you agree to the [Registration and Use Agreement](agreements/registration-and-use-agreement-sokg.md), the [Acceptable Use Policy](agreements/acceptable-use-policy.md), and the [Privacy Policy](agreements/privacy-policy.md).
- Sub-domains under [BYOS](#bring-your-own-suffix-byos) suffixes follow the same rules, plus the [BYOS Suffix Sub-domain Registration Agreement](agreements/byos-subdomain-registration-agreement.md), and depend on a domain owned by a third party.
- Please deploy something within **30 days**. Domains held for 30 consecutive days without content are gently reclaimed, so resources go to people who actually use them.

## Report abuse

Phishing, fraud, gambling, malware, or anything else that violates the Acceptable Use Policy is taken down without compromise, and every report is reviewed. If you find a domain being used to deceive or harm people, please tell us:

- Online: [s.eus/report](https://s.eus/report)
- Email: [abuse-report@publicfreesuffix.org](mailto:abuse-report@publicfreesuffix.org)

## Where did the pull-request flow go?

Between 2025 and 2026, registrations were handled through pull requests in this repository. That flow has been retired; the web console is faster and friendlier for everyone. Your suffix priority is preserved: sign in to the [domain console](https://s.eus/domains) with your original Whois email address and your domain will be allocated to you automatically. Allocations can be completed from October 7, 2026 onward, and the My Domains page shows the status of each of your domains.

## Community

Public Free Suffix is built and continuously operated by the [SEUS Community](https://s.eus): a global community of friends talking domains, hosting, servers, software, Super Intelligence/AI, and everyday life. Domain Names, Servers, Software and Super Intelligence, In a Snap.

Questions, ideas, or just want to say hi? Post on the community with the **#PFS** tag. We read everything. Announcements and progress notes live on the [project blog](https://publicfreesuffix.org/blog), also available as [RSS](https://publicfreesuffix.org/feed.xml).
