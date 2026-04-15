import { forwardRef, createContext, useContext } from 'react';
import cx from 'classnames';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import styles from './Table.module.scss';

/* ─── Context ─── */
const TableContext = createContext({ size: 'md' });

/* ─── Root ─── */
export const Table = forwardRef(function Table(
  {
    size = 'md',
    variant = 'simple',
    layout = 'auto',
    hoverable = false,
    bordered = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <TableContext.Provider value={{ size }}>
      <table
        ref={ref}
        className={cx(
          styles.table,
          styles[size],
          variant === 'striped' && styles.striped,
          hoverable && styles.hoverable,
          bordered && styles.bordered,
          layout === 'fixed' && styles.fixed,
          className,
        )}
        {...rest}
      >
        {children}
      </table>
    </TableContext.Provider>
  );
});

/* ─── Header ─── */
const Header = forwardRef(function Header(
  { sticky = false, stickyOffset = '0', className, children, style, ...rest },
  ref,
) {
  return (
    <thead
      ref={ref}
      className={cx(styles.header, sticky && styles.sticky, className)}
      style={sticky ? { top: stickyOffset, ...style } : style}
      {...rest}
    >
      {children}
    </thead>
  );
});

/* ─── Body ─── */
const Body = forwardRef(function Body({ className, children, ...rest }, ref) {
  return (
    <tbody ref={ref} className={cx(styles.body, className)} {...rest}>
      {children}
    </tbody>
  );
});

/* ─── Footer ─── */
const Footer = forwardRef(function Footer({ className, children, ...rest }, ref) {
  return (
    <tfoot ref={ref} className={cx(styles.footer, className)} {...rest}>
      {children}
    </tfoot>
  );
});

/* ─── Caption ─── */
const Caption = forwardRef(function Caption({ className, children, ...rest }, ref) {
  return (
    <caption ref={ref} className={cx(styles.caption, className)} {...rest}>
      {children}
    </caption>
  );
});

/* ─── Row ─── */
const Row = forwardRef(function Row({ selected = false, className, children, ...rest }, ref) {
  return (
    <tr ref={ref} className={cx(styles.row, selected && styles.selected, className)} {...rest}>
      {children}
    </tr>
  );
});

/* ─── Head (th) ─── */
const SORT_ICON_SIZE = { sm: 12, md: 14, lg: 16 };

const Head = forwardRef(function Head(
  {
    align = 'left',
    sortable = false,
    sortDirection = 'none',
    width,
    className,
    children,
    onSort,
    style,
    ...rest
  },
  ref,
) {
  const { size } = useContext(TableContext);
  const iconSize = SORT_ICON_SIZE[size] || 14;

  const alignClass =
    align === 'center' ? styles.alignCenter :
    align === 'right'  ? styles.alignRight  :
    styles.alignLeft;

  const ariaSortValue =
    sortDirection === 'asc'  ? 'ascending'  :
    sortDirection === 'desc' ? 'descending' :
    sortable                 ? 'none'       :
    undefined;

  const SortIcon =
    sortDirection === 'asc'  ? ChevronUp   :
    sortDirection === 'desc' ? ChevronDown  :
    ChevronsUpDown;

  return (
    <th
      ref={ref}
      scope="col"
      aria-sort={ariaSortValue}
      className={cx(styles.head, alignClass, className)}
      style={{ width, ...style }}
      {...rest}
    >
      {sortable ? (
        <button
          type="button"
          className={styles.sortButton}
          onClick={onSort}
        >
          {children}
          <span className={styles.sortIcon}>
            <SortIcon size={iconSize} />
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  );
});

/* ─── Cell (td) ─── */
const Cell = forwardRef(function Cell(
  { align = 'left', width, className, children, style, ...rest },
  ref,
) {
  const alignClass =
    align === 'center' ? styles.alignCenter :
    align === 'right'  ? styles.alignRight  :
    styles.alignLeft;

  return (
    <td
      ref={ref}
      className={cx(styles.cell, alignClass, className)}
      style={{ width, ...style }}
      {...rest}
    >
      {children}
    </td>
  );
});

/* ─── Attach sub-components ─── */
Table.Header  = Header;
Table.Body    = Body;
Table.Footer  = Footer;
Table.Caption = Caption;
Table.Row     = Row;
Table.Head    = Head;
Table.Cell    = Cell;
