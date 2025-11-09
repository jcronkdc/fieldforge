# Open Graph Integration & Tooling

This repository now ships a full Open Graph workflow so the marketing site renders rich link previews across social platforms.

## Metadata
- `Mobile app copy/web/index.html` sets the canonical Open Graph tags (`og:title`, `og:type`, `og:url`, `og:image`, `og:description`, `og:site_name`) in accordance with the [Open Graph protocol specification](https://ogp.me/).
- Additional tags (`article:tag`, `og:locale`, structured `og:image:*`) provide better context for downstream consumers.

## Validation Pipeline
1. **Local inspection** – run:
   ```sh
   pip install PyOpenGraph
   python tools/opengraph/inspect.py http://localhost:8080/index.html
   ```
   The script uses [PyOpenGraph](https://pypi.org/project/PyOpenGraph/) to return the parsed metadata for quick iteration.
2. **Static analyzers** – leverage community tooling such as [open-graph-protocol-tools](https://github.com/niallkennedy/open-graph-protocol-tools) or [opengraph-php](https://github.com/scottmac/opengraph) when integrating with PHP backends, and [opengraph-java](https://github.com/johndeverall/opengraph-java) / [RDF::RDFa::Parser](https://metacpan.org/dist/RDF-RDFa-Parser/view/lib/RDF/RDFa/Parser.pm) for Java and Perl environments.
3. **Facebook Sharing Debugger** – final validation through the official [Sharing Debugger](https://developers.facebook.com/tools/debug/) to confirm scrape results and cache busting.

## Upgrade Checklist
- Whenever the marketing visuals change, update the `og:image` asset and run the validator sequence above.
- For multilingual launches, duplicate tags using `og:locale:alternate`.
- Track validation results inside release notes to ensure parity across marketing channels.

## Useful References
- [Open Graph protocol spec](https://ogp.me/)
- [PyOpenGraph](https://pypi.org/project/PyOpenGraph/)
- [niallkennedy/open-graph-protocol-tools](https://github.com/niallkennedy/open-graph-protocol-tools)
- [scottmac/opengraph](https://github.com/scottmac/opengraph)
- [johndeverall/opengraph-java](https://github.com/johndeverall/opengraph-java)
- [RDF::RDFa::Parser](https://metacpan.org/dist/RDF-RDFa-Parser/view/lib/RDF/RDFa/Parser.pm)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

