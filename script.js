
document.addEventListener("DOMContentLoaded", function () {

  const links = document.querySelectorAll(".nav-link");

  // Encontra o destino de cada item do menu
  const destinations = Array.from(links)
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(function (element) {
      return element !== null;
    });

  // Destaca o item ativo
  function updateActiveLink(id) {
    links.forEach(function (link) {
      const active = link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", active);
    });
  }

  // Controla a navegação ao clicar no menu
  links.forEach(function (link) {

    link.addEventListener("click", function (event) {

      const destination = document.querySelector(
        this.getAttribute("href")
      );

      if (!destination) {
        return;
      }

      event.preventDefault();

      updateActiveLink(destination.id);

      destination.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      history.replaceState(
        null,
        "",
        "#" + destination.id
      );

    });

  });

  // Atualiza o menu conforme a navegação pela página
  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      function (entries) {

        const visible = entries
          .filter(function (entry) {
            return entry.isIntersecting;
          })
          .sort(function (a, b) {
            return a.boundingClientRect.top -
                   b.boundingClientRect.top;
          });

        if (visible.length > 0) {
          updateActiveLink(visible[0].target.id);
        }

      },
      {
        rootMargin: "-10% 0px -75% 0px",
        threshold: 0
      }
    );

    destinations.forEach(function (destination) {
      observer.observe(destination);
    });

  }

  console.log("PROSPERA iniciada com sucesso.");

});
