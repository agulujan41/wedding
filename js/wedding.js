// Preloader
$(window).on("load", function () {
  var Body = $("body");
  Body.addClass("preloader-site");
  $(".preloader-wrapper").fadeOut("slow");
  $("body").removeClass("preloader-site");
});

$(document).ready(function () {
  // Mobile Bottom Nav Hide/Show on Scroll
  let lastScrollTop = 0;
  const bottomNav = $('#bottom-nav');
  let scrollTimeout;

  $(window).on('scroll', function() {
    let st = $(this).scrollTop();

    // Clear timeout if still scrolling
    clearTimeout(scrollTimeout);

    if (st > lastScrollTop && st > 100) {
      // Scrolling down - hide
      bottomNav.addClass('nav-hidden');
    } else {
      // Scrolling up - show
      bottomNav.removeClass('nav-hidden');
    }

    lastScrollTop = st;

    // Show menu after 500ms of no scrolling
    scrollTimeout = setTimeout(function() {
      bottomNav.removeClass('nav-hidden');
    }, 500);
  });

  // Load dynamic data from global variables (data/data.js and data/fixtures.js)
  loadInvitationData();

  // Highlight active bottom nav item on scroll
  $(window).on('scroll', function() {
    let scrollPos = $(document).scrollTop();
    $('.bottom-nav-item').each(function() {
      let currLink = $(this);
      let refElement = $(currLink.attr("href"));
      if (refElement.length && refElement.position().top <= scrollPos + 150 && refElement.position().top + refElement.outerHeight() > scrollPos) {
        $('.bottom-nav-item').removeClass("active");
        currLink.addClass("active");
      }
    });
  });
});

function loadInvitationData() {
  const data = INVITATION_DATA;
  const fixtures = FIXTURES_DATA;

  // Update Page Title and Favicon
  document.title = data.ui.page_title;
  $("#page-title").text(data.ui.page_title);
  $("#og-title").attr("content", `${data.ui.page_title} - ${data.couple.bride} & ${data.couple.groom}`);
  $("#og-description").attr("content", data.ui.main_message.replace(/<br>/g, " "));
  $('link[rel="icon"]').attr("href", fixtures.images.favicon);
  $(".preloader img").attr("src", fixtures.images.favicon);

  // Update Hero
  $("#hero-subtitle").text(data.ui.hero_subtitle);
  $("#couple-names-header").text(`${data.couple.bride} & ${data.couple.groom}`);
  $("#event-location-summary").html(
    `${data.event.day}, ${data.event.date} ${data.event.month_year}<br>${data.event.location_name}`
  );
  $(".hero").css(
    "background",
    `linear-gradient(rgba(47, 62, 70, 0.4), rgba(47, 62, 70, 0.6)), url("${fixtures.images.hero}") no-repeat`
  );
  $(".hero").css("background-size", "cover");

  // Update Navigation
  $("#nav-waktu, #nav-desktop-waktu").text(data.ui.nav.waktu);
  $("#nav-lokasi, #nav-desktop-lokasi").text(data.ui.nav.lokasi);
  $("#nav-tentang, #nav-desktop-tentang").text(data.ui.nav.tentang);
  $("#nav-rsvp, #nav-desktop-rsvp").text(data.ui.nav.rsvp);
  $("#nav-desktop-home").text(data.ui.nav.home);

  // Update Main Message
  $("#main-message").html(data.ui.main_message);

  // Update Couple Names
  $("#bride-name").text(data.couple.bride_full_name);
  $("#groom-name").text(data.couple.groom_full_name);

  // Update Event Section (Cuándo)
  $("#title-waktu").text(data.ui.section_titles.waktu);
  $("#event-day").text(data.event.day);
  $("#event-date").text(data.event.date);
  $("#event-month-year").text(data.event.month_year);
  $("#akad-label").text(data.ui.labels.akad);
  $("#akad-time").text(data.event.akad_time);
  $("#resepsi-label").text(data.ui.labels.resepsi);
  $("#resepsi-time").text(data.event.resepsi_time);

  // Update Location Section (Dónde)
  $("#title-lokasi").text(data.ui.section_titles.lokasi);
  $("#location-name").text(data.event.location_name);
  $("#location-address").text(data.event.location_address);
  $("#maps-iframe").attr("src", fixtures.links.mapsEmbed);
  $("#maps-btn-label").text(data.ui.labels.maps_btn);
  $("#maps-link").attr("href", fixtures.links.googleMaps);
  $("#calendar-btn-label").text(data.ui.labels.calendar_btn);
  $("#calendar-link").attr("href", fixtures.links.googleCalendar);

  // Update Story Section
  $("#story-title").text(data.ui.section_titles.tentang);
  data.story.forEach(function (item, index) {
    var storyIndex = index + 1;
    $(".foto" + storyIndex + " .title-foto").text(item.title);
    $(".foto" + storyIndex + " .subtitle-foto").html(item.description);
    if (fixtures.images.story[index]) {
      $(".foto" + storyIndex).css(
        "background-image",
        `linear-gradient(rgba(47, 62, 70, 0.4), rgba(47, 62, 70, 0.6)), url("${fixtures.images.story[index]}")`
      );
    }
  });

  // Update Countdown Labels
  $("#label-days").text("Días");
  $("#label-hours").text("Horas");
  $("#label-minutes").text("Minutos");
  $("#label-seconds").text("Segundos");

  // Update RSVP Section
  $("#title-rsvp").text(data.ui.section_titles.rsvp);
  $("#rsvp-paragraph").html(data.ui.rsvp_paragraph);
  $(".bride-name-short").text(data.couple.bride);
  $(".groom-name-short").text(data.couple.groom);
  $("#whatsapp-bride-label").text(data.ui.labels.whatsapp_bride);
  $("#whatsapp-groom-label").text(data.ui.labels.whatsapp_groom);
  $("#social-footer-label").text(data.ui.labels.social_footer);

  var waTextBride = encodeURIComponent(
    "Hola " + data.couple.bride + ", voy a confirmar mi asistencia a la boda"
  );
  var waTextGroom = encodeURIComponent(
    "Hola " + data.couple.groom + ", voy a confirmar mi asistencia a la boda"
  );
  $("#whatsapp-bride").attr(
    "href",
    "https://api.whatsapp.com/send?phone=" + fixtures.links.whatsapp_bride + "&text=" + waTextBride
  );
  $("#whatsapp-groom").attr(
    "href",
    "https://api.whatsapp.com/send?phone=" + fixtures.links.whatsapp_groom + "&text=" + waTextGroom
  );

  // Update Instagram
  $(".bride-ig").text(data.couple.instagram_bride);
  $(".groom-ig").text(data.couple.instagram_groom);
  $("#instagram-bride").attr("href", "https://instagram.com/" + data.couple.instagram_bride);
  $("#instagram-groom").attr("href", "https://instagram.com/" + data.couple.instagram_groom);

  // Initialize Countdown
  if ($("#hitungmundur").length > 0) {
    $("#hitungmundur").countdown({
      date: data.event.full_date,
      offset: +7,
      day: "Día",
      days: "Días"
    });
  }
}

// Hamburger Menu
document.addEventListener("DOMContentLoaded", function () {
  var $navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll(".navbar-burger"),
    0
  );
  if ($navbarBurgers.length > 0) {
    $navbarBurgers.forEach(function ($el) {
      $el.addEventListener("click", function () {
        var target = $el.dataset.target;
        var $target = document.getElementById(target);
        $el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });
    });
  }
});

// Smooth Anchor Scrolling
$(document).on("click", 'a[href^="#"]', function (event) {
  event.preventDefault();
  $("html, body").animate(
    { scrollTop: $($.attr(this, "href")).offset().top },
    500
  );
});

// Scroll to top button
window.onscroll = function () { scrollFunction(); };

function scrollFunction() {
  const toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.style.display =
      document.body.scrollTop > 20 || document.documentElement.scrollTop > 20
        ? "block"
        : "none";
  }
}
