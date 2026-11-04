
document.addEventListener("DOMContentLoaded", function () {

  const links = document.querySelectorAll(".nav-link");

  // Localiza todos os destinos existentes no menu
  const sections = Array.from(links)
    .map(function (link) {
      const id = link.getAttribute("href").replace("#", "");
      return document.getElementById(id);
    })
    .filter(function (section) {
      return section !== null;
    });

  // Atualiza o item ativo do menu
  function updateActiveLink(id) {
    links.forEach(function (link) {
      const isActive = link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", isActive);
    });
  }

  // Ao clicar no menu, destaca o destino
  links.forEach(function (link) {
    link.addEventListener("click", function () {
      const id = this.getAttribute("href").replace("#", "");
      updateActiveLink(id);
    });
  });

  // Acompanha a seção visível na tela
  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      function (entries) {

        const visibleSections = entries
          .filter(function (entry) {
            return entry.isIntersecting;
          })
          .sort(function (a, b) {
            return b.intersectionRatio - a.intersectionRatio;
          });

        if (visibleSections.length > 0) {
          updateActiveLink(visibleSections[0].target.id);
        }

      },
      {
        rootMargin: "-15% 0px -65% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });

  }

  console.log("PROSPERA iniciada com sucesso.");

});
