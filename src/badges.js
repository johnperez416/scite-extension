const queryString = require('query-string')

const BADGE_SCRIPT = `
<link rel="stylesheet" type="text/css" href="https://cdn.scite.ai/badge/scite-badge-latest.min.css">
<script async type="application/javascript" src="https://cdn.scite.ai/badge/scite-badge-latest.min.js">
</script>`

function createBadge (doi) {
  return `<div class="scite-badge" data-doi="${doi}" data-layout="horizontal" data-small="true"/>`
}

/**
 * findPubMedDOIEls looks in cite tags for text beginning with DOI and captures it as a doi
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findPubMedDOIEls () {
  const els = []
  const cites = document.body.querySelectorAll('.docsum-content')
  for (const cite of cites) {
    const re = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig
    const text = cite.textContent.match(re)
    if (text && text.length > 0) {
      els.push({
        citeEl: cite,
        // Pubmed puts a period at the end of their dois for biblographic display reasons.
        // We must slice it.
        doi: text[0].slice(0, -1)
      })
    }
  }
  const references = document.body.querySelectorAll('.references-and-notes-list')
  for (const reference of references) {
    const re = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig
    const text = reference.textContent.match(re)
    if (text && text.length > 0) {
      els.push({
        citeEl: reference,
        // Pubmed puts a period at the end of their dois for biblographic display reasons.
        // We must slice it.
        doi: text[0].slice(0, -1)
      })
    }
  }
  return els
}

function removeElementsByClass (className) {
  const elements = document.getElementsByClassName(className)
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0])
  }
}

/**
 * addPMSeeAllReferencesListener adds an event listener on seeing all references so we can
 * reload badges.
 */
function addPMSeeAllReferencesListener () {
  const showAll = document.body.querySelector('.show-all')
  if (showAll) {
    showAll.addEventListener('click', () => {
      removeElementsByClass('scite-badge')
      setTimeout(() => insertBadges(), 1000)
    })
  }
}

/**
 * findPubMedDOIEls looks in cite tags for text beginning with DOI and captures it as a doi
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findPubMedCentralDOIEls () {
  const els = []
  const cites = document.body.querySelectorAll('.rslt')
  for (const cite of cites) {
    const doiEl = cite.querySelector('.doi')
    try {
      const re = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig
      const doi = doiEl.textContent.match(re)
      if (doi && doi.length > 0) {
        els.push({
          citeEl: cite,
          doi: doi[0]
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  let references = document.body.querySelectorAll('.element-citation')
  for (const reference of references) {
    const re = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig
    const text = reference.textContent.match(re)
    if (text && text.length > 0) {
      els.push({
        citeEl: reference,
        // Pubmed puts a period at the end of their dois for biblographic display reasons.
        // We must slice it.
        doi: text[0].slice(0, -1)
      })
    }
  }

  references = document.body.querySelectorAll('.mixed-citation')
  for (const reference of references) {
    const re = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig
    const text = reference.textContent.match(re)
    if (text && text.length > 0) {
      els.push({
        citeEl: reference,
        // Pubmed puts a period at the end of their dois for biblographic display reasons.
        // We must slice it.
        doi: text[0].slice(0, -1)
      })
    }
  }
  return els
}

/**
 * findWikipediaDOIEls looks in cite tags for anchors that link to doi.org and have a doi.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findWikipediaDOIEls () {
  const els = []
  const cites = document.body.querySelectorAll('cite')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      if (anchor.href.match(/doi\.org\/(.+)/) && anchor.textContent.match(/10\.(.+)/)) {
        els.push({
          citeEl: cite,
          doi: anchor.textContent
        })
      }
    }
  }
  return els
}

/**
 * findScienceDirectDOIs looks in reference tags for anchors that link to doi.org and have a doi.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findScienceDirectDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.reference')

  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)

      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: doi[1]
        })
      }
    }
  }
  return els
}

/**
 * findELifeSciencesDOIs looks in doi tags that link to doi.org.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findELifeSciencesDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.doi')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: doi[1]
        })
      }
    }
  }
  return els
}

/**
 * findNatureDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findNatureDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.c-article-references__links')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
      }
    }
  }
  cites = document.body.querySelectorAll('.c-reading-companion__reference-item')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        break
      }
    }
  }
  return els
}

/**
 * findSpringerDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findSpringerDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.c-article-references__links')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
      }
    }
  }
  cites = document.body.querySelectorAll('.c-reading-companion__reference-item')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        break
      }
    }
  }
  return els
}

/**
 * findGoogleScholarDOIs looks in reference tags that has doi.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findGoogleScholarDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.gs_r')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/10\.(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[0])
        })
        break
      }
    }
  }
  return els
}

/**
 * findGoogleDOIs looks in reference tags that link has doi.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findGoogleDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.rc')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/10\.(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[0])
        })
        break
      }
    }
  }
  return els
}

/**
 * findPLOSDOIs looks in reference tags that have dois or dataset.doi.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findPLOSDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.reflinks')
  for (const cite of cites) {
    els.push({
      citeEl: cite,
      doi: cite.dataset.doi
    })
  }
  cites = document.body.querySelectorAll('dd')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/10\.(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[0])
        })
        break
      }
    }
  }
  return els
}

/**
 * findORCIDDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findORCIDDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.url-work')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      if (anchor.href.match(/doi\.org\/(.+)/) && anchor.textContent.match(/10\.(.+)/)) {
        els.push({
          citeEl: cite,
          doi: anchor.textContent
        })
        break
      }
    }
  }
  return els
}

/**
 * findACSDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findACSDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.issue-item')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('.issue-item_doi')
    for (const anchor of anchors) {
      const doi = anchor.textContent.match(/10\.(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: doi[0]
        })
        break
      }
    }
  }
  cites = document.body.querySelectorAll('a[title="DOI URL"]')
  for (const cite of cites) {
    const doi = cite.href.match(/10\.(.+)/)
    if (doi && doi.length > 1) {
      els.push({
        citeEl: cite,
        doi: decodeURIComponent(doi[0])
      })
    }
  }
  return els
}

/**
 * findMDPIDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findMDPIDOIs () {
  const els = []
  const cites = document.body.querySelectorAll('.article-item')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: doi[1]
        })
      }
    }
  }
  return els
}

/**
 * findSageDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findSageDOIs () {
  const els = []
  let cites = document.body.querySelectorAll("tr[id*='bibr'] td:nth-child(2)")
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const qs = queryString.parse(anchor.href)
      if (qs && qs.key) {
        els.push({
          citeEl: cite,
          doi: qs.key
        })
      }
    }
  }
  cites = document.body.querySelectorAll('.searchResultItem')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      let doi = anchor.href.match(/doi\/full\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        break
      }
      doi = anchor.href.match(/doi\/pdf\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        break
      }
    }
  }
  return els
}

/**
 * findTandFDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findTandFDOIs () {
  const els = []
  let cites = document.body.querySelectorAll("li[id*='CIT']")
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const qs = queryString.parse(anchor.href)
      if (qs && qs.key) {
        els.push({
          citeEl: cite,
          doi: qs.key
        })
      }
    }
  }
  cites = document.body.querySelectorAll('.citedByEntry')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
      }
    }
  }
  cites = document.body.querySelectorAll('.searchResultItem')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      let doi = anchor.href.match(/doi\/full\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        break
      }
      doi = anchor.href.match(/doi\/pdf\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        break
      }
    }
  }
  return els
}

/**
 * findSPIEDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findSPIEDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.ref-content')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
      }
    }
  }
  cites = document.body.querySelectorAll('.ArticleContentAnchorRow')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
      }
    }
  }
  cites = document.body.querySelectorAll('.TOCLineItemRow2')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const qs = queryString.parse(anchor.href)
      if (qs && qs.DOI) {
        els.push({
          citeEl: cite,
          doi: qs.DOI
        })
      }
    }
  }
  return els
}

/**
 * findSPIEDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findWileyDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.item__body')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/doi\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
      }
    }
  }
  cites = document.body.querySelectorAll('.citedByEntry')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
      }
    }
  }
  cites = document.body.querySelectorAll("li[data-bib-id*='bib']")
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const qs = queryString.parse(anchor.href)
      if (qs && qs.key) {
        els.push({
          citeEl: cite,
          doi: qs.key
        })
      }
    }
  }
  return els
}

/**
 * findSPIEDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findKargerDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.ref')
  for (const cite of cites) {
    const anchors = cite.querySelectorAll('a')
    for (const anchor of anchors) {
      const doi = anchor.href.match(/doi\.org\/(.+)/)
      if (doi && doi.length > 1) {
        els.push({
          citeEl: cite,
          doi: decodeURIComponent(doi[1])
        })
        break
      }
    }
  }
  cites = document.body.querySelectorAll('.hit-item-date')
  for (const cite of cites) {
    const re = /(10.\d{4,9}\/[-._;()/:A-Z0-9]+)/ig
    const text = cite.textContent.match(re)
    if (text && text.length > 0) {
      els.push({
        citeEl: cite,
        doi: text[0]
      })
    }
  }
  return els
}

/**
 * findSPIEDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findBioArxivDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.highwire-cite-metadata-doi')
  for (const cite of cites) {
    const text = cite.textContent.match(/doi\.org\/(.+)/)
    if (text && text.length > 0) {
      els.push({
        citeEl: cite,
        doi: text[1].trim()
      })
    }
  }
  cites = document.body.querySelectorAll('.ref-cit')
  for (const cite of cites) {
    const doi = cite.dataset.doi
    if (doi) {
      els.push({
        citeEl: cite,
        doi
      })
    }
  }
  return els
}

/**
 * findSPIEDOIs looks in reference tags that link to doi.org.
 * @returns {Array<{ citeEl: HTMLElement, doi: string}>} - Return
 */
function findPsyArxivDOIs () {
  const els = []
  let cites = document.body.querySelectorAll('.highwire-cite-metadata-doi')
  for (const cite of cites) {
    const text = cite.textContent.match(/doi\.org\/(.+)/)
    if (text && text.length > 0) {
      els.push({
        citeEl: cite,
        doi: text[1].trim()
      })
    }
  }
  cites = document.body.querySelectorAll('.ref-cit')
  for (const cite of cites) {
    const doi = cite.dataset.doi
    if (doi) {
      els.push({
        citeEl: cite,
        doi
      })
    }
  }
  return els
}

const BADGE_SITES = [
  {
    name: 'wikipedia.org',
    findDoiEls: findWikipediaDOIEls,
    position: 'afterend',
    style: `
<style>
.scite-badge {
  margin-left: 0.25rem;
}
</style>
`
  },
  {
    name: 'pubmed.ncbi.nlm.nih.gov',
    findDoiEls: findPubMedDOIEls,
    position: 'beforeend',
    initFunc: addPMSeeAllReferencesListener
  },
  {
    name: 'ncbi.nlm.nih.gov/pmc',
    findDoiEls: findPubMedCentralDOIEls,
    position: 'beforeend',
    style: `
<style>
.scite-badge {
  display: block;
  width: min-content;
  margin-top: 0.25rem;
}
</style>    
`
  },
  {
    name: 'sciencedirect.com',
    findDoiEls: findScienceDirectDOIs,
    position: 'beforeend'
  },
  {
    name: 'elifesciences.org',
    findDoiEls: findELifeSciencesDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.25rem 0;
    }
    </style>
`
  },
  {
    name: 'nature.com',
    findDoiEls: findNatureDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.5rem 0;
      margin-left: auto;
    }
    </style>
`
  },
  {
    name: 'scholar.google.com',
    findDoiEls: findGoogleScholarDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.25rem 0;
    }
    </style>
`
  },
  {
    name: 'google',
    findDoiEls: findGoogleDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.25rem 0;
    }
    </style>
`
  },
  {
    name: 'journals.plos.org',
    findDoiEls: findPLOSDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
    }
    </style>
`
  },
  {
    name: 'orcid.org',
    findDoiEls: findORCIDDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.25rem 0;
    }
    </style>
`
  },
  {
    name: 'pubs.acs.org',
    findDoiEls: findACSDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.5rem 0;
    }
    </style>
`
  },
  {
    name: 'springer.com',
    findDoiEls: findSpringerDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.5rem 0;
      margin-left: auto;
    }
    </style>
`
  },
  {
    name: 'mdpi.com',
    findDoiEls: findMDPIDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.5rem 0;
    }
    </style>
`
  },
  {
    name: 'journals.sagepub.com',
    findDoiEls: findSageDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.5rem 0;
    }
    </style>
`
  },
  {
    name: 'tandfonline.com',
    findDoiEls: findTandFDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      display: block;
      width: min-content;
      margin: 0.25rem 0;
    }
    </style>
`
  },
  {
    name: 'spiedigitallibrary.org',
    findDoiEls: findSPIEDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      display: inline-block;
      margin-left: 0.25rem;
    }
    </style>
`
  },
  {
    name: 'onlinelibrary.wiley.com',
    findDoiEls: findWileyDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      display: block;
      margin: 0.25rem 0;
      width: min-content;
    }
    </style>
`
  },
  {
    name: 'karger.com',
    findDoiEls: findKargerDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      display: block;
      margin: 0.25rem 0;
      width: max-content;
    }
    </style>
`
  },
  {
    name: 'biorxiv.org',
    findDoiEls: findBioArxivDOIs,
    position: 'beforeend',
    style: `
    <style>
    .scite-badge {
      display: block !important;
      margin: 0.25rem 0 !important;
      width: max-content !important;
    }
    .scite-badge div {
      margin: revert !important;
      padding: 0 0.125rem !important
    }
    </style>
`
  },
  {
    name: 'medrxiv.org',
    findDoiEls: findBioArxivDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block !important;
      margin: 0.25rem 0 !important;
      width: max-content !important;
    }
    .scite-badge div {
      margin: revert !important;
      padding: 0 0.125rem !important
    }
    </style>
`
  },
  {
    name: 'psyarxiv.org',
    findDoiEls: findPsyArxivDOIs,
    position: 'afterend',
    style: `
    <style>
    .scite-badge {
      display: block !important;
      margin: 0.25rem 0 !important;
      width: max-content !important;
    }
    .scite-badge div {
      margin: revert !important;
      padding: 0 0.125rem !important
    }
    </style>
`
  }
]

export default function insertBadges () {
  let badgeSite
  for (const site of BADGE_SITES) {
    if (window.location.href.includes(site.name)) {
      badgeSite = site
    }
  }
  if (!badgeSite) {
    return
  }

  const els = badgeSite.findDoiEls()
  if (!els || els.length <= 0) {
    return
  }

  for (const el of els) {
    el.citeEl.insertAdjacentHTML(badgeSite.position, createBadge(el.doi))
  }

  // if we have dois then add badge to them.
  // use range and contextual fragment so the script gets executed.
  const range = document.createRange()
  range.setStart(document.documentElement, 0)
  document.documentElement.appendChild(
    range.createContextualFragment(BADGE_SCRIPT)
  )
  if (badgeSite.style) {
    document.documentElement.appendChild(
      range.createContextualFragment(badgeSite.style)
    )
  }

  if (badgeSite.initFunc) {
    badgeSite.initFunc()
  }
}
