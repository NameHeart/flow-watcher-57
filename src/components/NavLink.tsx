import { NavLink as RouterNavLink } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const NavLink = forwardRef((props: any, ref: any) => {
  const { className, activeClassName, pendingClassName, to, ...rest } = props;
  return (
    <RouterNavLink
      ref={ref}
      to={to}
      className={({ isActive, isPending }: any) =>
        cn(className, isActive && activeClassName, isPending && pendingClassName)
      }
      {...rest}
    />
  );
});

NavLink.displayName = "NavLink";

export { NavLink };
