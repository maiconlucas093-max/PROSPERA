
document.addEventListener("DOMContentLoaded", function () {

  const links = document.querySelectorAll(".nav-link");

  // Destaca o item selecionado no menu
  links.forEach(function (link) {

    link.addEventListener("click", function () {

      links.forEach(function (item) {
        item.classList.remove("active");
      });

      this.classList.add("active");

    });

  });

  // Atualiza o destaque conforme a seção visualizada
  const sections = document.querySelectorAll(
    "main section[id]"
  );

  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      function (entries) {

        entries.forEach(function (entry) {

          if (entry.isIntersecting) {

            const id = entry.target.id;

            links.forEach(function (link) {

              link.classList.toggle(
                "active",
                link.getAttribute("href") === "#" + id
              );

            });

          }

        });

      },
      {
        rootMargin: "-20% 0px -65% 0px"
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });

  }

  console.log("PROSPERA iniciada com sucesso.");

});
