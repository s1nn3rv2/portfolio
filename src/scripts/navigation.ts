const links = document.querySelectorAll<HTMLAnchorElement>('.animating-menu-link');
const folderRoot = document.getElementById('folder-root') as HTMLDivElement | null;
const mobileTopNav = document.getElementById('mobile-top-nav') as HTMLDivElement | null;

interface MobileLinks {
    [key: string]: HTMLAnchorElement | null;
}

const mobileLinks: MobileLinks = {
    projects: document.getElementById('mob-projects') as HTMLAnchorElement | null,
    skills: document.getElementById('mob-skills') as HTMLAnchorElement | null,
    contact: document.getElementById('mob-contact') as HTMLAnchorElement | null
};

const sections: Record<string, HTMLElement | null> = {};
const placeholders: Record<string, HTMLElement | null> = {};

interface PlaceholderCache {
    docLeft: number;
    docTop: number;
}
const placeholderCaches: Record<string, PlaceholderCache> = {};
const sectionTops: Record<string, number> = {};

links.forEach(link => {
    const id = link.id.replace('link-', '');
    sections[id] = document.getElementById(id);
    placeholders[id] = document.getElementById(`placeholder-${id}`);
});

function cacheLayout(): void {
    const scrollY = window.scrollY;

    links.forEach(link => {
        const id = link.id.replace('link-', '');
        const placeholder = placeholders[id];
        if (placeholder) {
            const rect = placeholder.getBoundingClientRect();
            placeholderCaches[id] = {
                docLeft: rect.left + window.scrollX,
                docTop: rect.top + scrollY
            };
        }
    });

    Object.keys(sections).forEach(id => {
        const section = sections[id];
        if (section) {
            sectionTops[id] = section.offsetTop;
        }
    });
}

function updatePositions(): void {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const isMobile = window.innerWidth < 768;

    let activeId: string | null = null;
    const reversedIds = ['contact', 'skills', 'projects'];
    const threshold = isMobile ? 80 : 148;

    for (const id of reversedIds) {
        const top = sectionTops[id];
        if (top !== undefined) {
            if (top - scrollY <= threshold) {
                activeId = id;
                break;
            }
        }
    }

    let anySticky = false;

    const targetTopBase = isMobile ? 16 : 48;
    const targetLeft = isMobile ? 16 : 36;
    const itemSpacing = isMobile ? 24 : 40;
    const targetScale = isMobile ? 0.95 : 1.6;

    links.forEach((link, index) => {
        const id = link.id.replace('link-', '');
        const cache = placeholderCaches[id];

        if (!cache) return;

        const px = cache.docLeft;
        const py = cache.docTop - scrollY;

        let currentX = 0;
        let currentY = 0;
        let currentScale = 1;
        let isSticky = false;

        const tx = targetLeft;
        const ty = targetTopBase + itemSpacing * (index + 1);

        const startScroll = viewportHeight * 0.25;
        const endScroll = viewportHeight;

        if (isMobile) {
            currentX = px;
            currentY = py;
            currentScale = 1;
            isSticky = false;
        } else {
            if (scrollY >= endScroll) {
                currentX = tx;
                currentY = ty;
                currentScale = targetScale;
                isSticky = true;
                anySticky = true;
            } else {
                const progress = Math.min(Math.max((scrollY - startScroll) / (endScroll - startScroll), 0), 1);
                const easeProgress = progress * (2 - progress); // easeOutQuad

                currentX = px + (tx - px) * easeProgress;
                currentY = py + (ty - py) * easeProgress;
                currentScale = 1 + (targetScale - 1) * easeProgress;

                isSticky = progress > 0.1;
                if (isSticky) anySticky = true;
            }
        }

        link.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${currentScale})`;
        link.style.opacity = '1';
        link.style.pointerEvents = 'auto';

        if (isSticky) {
            link.classList.add('is-sticky');
            if (id === activeId) {
                link.classList.remove('text-white/45');
                link.classList.add('text-white');
            } else {
                link.classList.add('text-white/45');
                link.classList.remove('text-white');
            }
        } else {
            link.classList.remove('is-sticky');
            link.classList.add('text-white/45');
            link.classList.remove('text-white');
        }
    });

    if (folderRoot) {
        if (!isMobile && anySticky) {
            folderRoot.style.opacity = '1';
            folderRoot.style.transform = `translate3d(${targetLeft}px, ${targetTopBase}px, 0) scale(${targetScale})`;
        } else {
            folderRoot.style.opacity = '0';
        }
    }

    if (mobileTopNav) {
        if (isMobile && scrollY >= viewportHeight - 80) {
            mobileTopNav.style.opacity = '1';
            mobileTopNav.style.pointerEvents = 'auto';
        } else {
            mobileTopNav.style.opacity = '0';
            mobileTopNav.style.pointerEvents = 'none';
        }
    }

    if (isMobile) {
        Object.keys(mobileLinks).forEach(key => {
            const mLink = mobileLinks[key];
            if (!mLink) return;
            if (key === activeId) {
                mLink.classList.remove('text-white/45');
                mLink.classList.add('text-white');
            } else {
                mLink.classList.add('text-white/45');
                mLink.classList.remove('text-white');
            }
        });
    }
}

let ticking = false;
function onScroll(): void {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updatePositions();
            ticking = false;
        });
        ticking = true;
    }
}

cacheLayout();

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => {
    cacheLayout();
    updatePositions();
}, { passive: true });

updatePositions();

document.addEventListener('DOMContentLoaded', () => {
    cacheLayout();
    updatePositions();
});
window.addEventListener('load', () => {
    cacheLayout();
    updatePositions();
});
