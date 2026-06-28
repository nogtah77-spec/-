---
name: alamoudi property classification & display
description: How the alamoudi Property is classified and identified, and how the Home filter UI maps onto it.
---

## Property.category is a single enum — there is no "residential"
`Property.category` is one of `sale | rent | furnished | administrative | medical | commercial`. There is NO separate "sector" field and NO "residential" value. All seed properties are `category: "sale"`.

The Home search widget has TWO button rows that imply two dimensions: a transaction row (sale/rent/furnished) and a sector row (residential/administrative/medical/commercial). They both map onto the single `category` field.

**Rule:** to filter, collapse the two rows with
`effectiveCategory = searchSector === "residential" ? searchCategory : searchSector`.
**Why:** a property can only have ONE category, so naively AND-ing both rows (e.g. sale AND residential) yields zero results; "residential" has no stored value so it defers to the transaction type, while a specialized sector (administrative/medical/commercial) overrides it.

## Identity is the CODE, not the title
PropertyCard and compact card display `property.code` as the heading (e.g. "S50"); `title` is only used for search-matching and img alt. The admin PropertyForm edits `code` (label "كود العقار"); on save `title` is set to mirror the code. `addProperty` respects a provided `code` and only falls back to `genCode()` when none is given.

## Home filtering UX
- Text search is live; the structured filters (category/sector/region/type) only apply after pressing بحث (`filtersApplied` flag).
- `isFiltering = filtersApplied || searchText !== ""`. When true, a results grid renders under the filter widget and the TikTok/featured/latest/finishing/CTA sections are hidden. "مسح الفلاتر" resets everything.
