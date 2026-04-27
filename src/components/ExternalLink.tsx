import { buildUrlWithParams } from "@/lib/navigation";
import { forwardRef } from "react";

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  preserveParams?: boolean;
}

/**
 * ExternalLink component that ALWAYS preserves URL parameters (UTMs, gclid,
 * fbclid, etc.) when redirecting. All navigations are forced through
 * window.location.href / window.open with window.location.search merged in.
 *
 * Usage:
 * <ExternalLink href="https://example.com/checkout">
 *   Go to checkout
 * </ExternalLink>
 */
const ExternalLink = forwardRef<HTMLAnchorElement, ExternalLinkProps>(
  ({ href, children, preserveParams = true, className, onClick, target, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;

      e.preventDefault();
      const finalUrl = preserveParams ? buildUrlWithParams(href) : href;

      if (target === "_blank") {
        window.open(finalUrl, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = finalUrl;
      }
    };

    // Pre-compute href so right-click / middle-click also carry params.
    const resolvedHref = (() => {
      if (!preserveParams) return href;
      try {
        return buildUrlWithParams(href);
      } catch {
        return href;
      }
    })();

    return (
      <a
        ref={ref}
        href={resolvedHref}
        target={target}
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </a>
    );
  }
);

ExternalLink.displayName = "ExternalLink";

export default ExternalLink;
