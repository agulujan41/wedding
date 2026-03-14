// Preloader and Envelope Logic
$(window).on("load", function () {
  const body = $("body");
  const preloader = $(".preloader-wrapper");
  const envelope = $("#envelope-wrapper");

  // Initial state: prevent scrolling while on envelope
  body.addClass("is-locked");

  // Hide initial preloader and show envelope
  preloader.fadeOut("slow", function() {
    // Start typing animation ONLY for names
    $("#envelope-names").addClass("animate");
  });

  // Also prepare the home typing elements so they're ready when the invitation opens
  // (they'll be triggered by triggerHomeTypingAnimation after the seal click)
});

// Audio Global
let mainAudio = new Audio('fixtures/music.mp3');
mainAudio.loop = true;

$(document).ready(function () {
  // Handle Seal Click
  $("#seal-trigger").on("click", function() {
    const sealContainer = $(this);
    const preloader = $(".preloader-wrapper");
    const envelope = $("#envelope-wrapper");
    const musicWrapper = $("#music-wrapper");

    // 1. Mark as clicked (starts rotation in CSS)
    sealContainer.addClass("clicked");

    // 2. Transition to Music Selection Screen
    setTimeout(() => {
      preloader.fadeIn("slow", function() {
        envelope.hide();
        musicWrapper.addClass("is-visible");
        preloader.fadeOut("slow");
      });
    }, 1000); 
  });

  // Handle Music Selection
  $("#btn-music-yes").on("click", function() {
    handleMusicChoice(true);
  });

  $("#btn-music-no").on("click", function() {
    handleMusicChoice(false);
  });

  function handleMusicChoice(withMusic) {
    const preloader = $(".preloader-wrapper");
    const musicWrapper = $("#music-wrapper");
    const body = $("body");

    if (withMusic) {
      // Start at 4 seconds
      mainAudio.currentTime = 4;
      mainAudio.volume = 0;
      mainAudio.play().catch(e => console.log("Audio play blocked", e));
      
      // Volume Fade-in
      let fadeAudio = setInterval(() => {
        if (mainAudio.volume < 0.9) {
          mainAudio.volume += 0.1;
        } else {
          mainAudio.volume = 1;
          clearInterval(fadeAudio);
        }
      }, 200);
    }

    // Prepare transition to Home
    preloader.fadeIn("slow", function() {
      musicWrapper.removeClass("is-visible");
      $("#music-control").addClass("is-active");
      if (!withMusic) {
        $("#music-toggle i").removeClass('fa-volume-up').addClass('fa-volume-mute');
      }

      body.removeClass("is-locked"); // Restore scrolling
      window.scrollTo(0,0);
      
      // Update UI visibility immediately after scroll to top (Ensures hidden on Hero)
      updateFloatingUI();

      // Re-trigger AOS and typing animations
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
      initAnimationObserver();
      setTimeout(() => { triggerHomeTypingAnimation(); }, 200);

      preloader.fadeOut(1000);
    });
  }
  // Mobile Bottom Nav Hide/Show on Scroll
  let lastScrollTop = 0;
  const bottomNav = $('#bottom-nav');
  const musicControl = $('#music-control');
  let scrollTimeout;

  function updateFloatingUI() {
    let st = $(window).scrollTop();
    const heroHeight = $('.hero').outerHeight() || window.innerHeight;
    const desktopNav = $('#desktop-nav-fixed');

    // --- Desktop Floating Nav ---
    if ($(window).width() > 768) {
      if (st > 300) {
        desktopNav.addClass('is-visible');
      } else {
        desktopNav.removeClass('is-visible');
      }
    }

    // --- Mobile Bottom Nav & Music Control ---
    const inHero = st < heroHeight * 0.85;

    if (inHero) {
      bottomNav.addClass('nav-hidden');
      musicControl.addClass('hidden-utility');
    } else {
      bottomNav.removeClass('nav-hidden');
      musicControl.removeClass('hidden-utility');
    }

    // Music Control Scroll Logic (Hide while scrolling, show when stopped)
    if (!inHero && musicControl.hasClass('is-active')) {
      musicControl.addClass('is-scrolling');
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        musicControl.removeClass('is-scrolling');
      }, 150); // Show after 150ms of no scroll
    } else {
      musicControl.removeClass('is-scrolling');
    }

    lastScrollTop = st;
  }

  $(window).on('scroll', updateFloatingUI);
  $(window).on('resize', updateFloatingUI);

  // Handle Music Toggle Button
  $("#music-toggle").on("click", function() {
    const icon = $(this).find('i');
    if (mainAudio.paused) {
      mainAudio.play();
      icon.removeClass('fa-volume-mute').addClass('fa-volume-up');
    } else {
      mainAudio.pause();
      icon.removeClass('fa-volume-up').addClass('fa-volume-mute');
    }
  });

  // Re-trigger names animation when user scrolls back to home
  let wasInHome = false;
  $(window).on('scroll.homeAnimation', function() {
    const scrollPos = $(this).scrollTop();
    const heroBottom = $('#home').outerHeight() || window.innerHeight;
    const inHome = scrollPos < heroBottom * 0.5;
    if (inHome && !wasInHome) {
      triggerHomeTypingAnimation();
    }
    wasInHome = inHome;
  });

  // Load dynamic data from global variables (data/data.js and data/fixtures.js)
  loadInvitationData();

  // Highlight active bottom and floating nav item on scroll
  $(window).on('scroll', function() {
    let scrollPos = $(document).scrollTop();
    $('.bottom-nav-item, .desktop-nav-fixed .navbar-item').each(function() {
      let currLink = $(this);
      let refElement = $(currLink.attr("href"));
      if (refElement.length && refElement.position().top <= scrollPos + 150 && refElement.position().top + refElement.outerHeight() > scrollPos) {
        $('.bottom-nav-item, .desktop-nav-fixed .navbar-item').removeClass("active");
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

  // Update Hero & Envelope
  $("#envelope-message").text(data.ui.envelope_message);
  $("#envelope-names").text(`${data.couple.bride} & ${data.couple.groom}`);
  
  $("#hero-subtitle").text(data.ui.hero_subtitle);
  // couple-names-header is updated later with full names (see Update Couple Names below)
  $("#event-location-summary").html(
    `${data.event.day}, ${data.event.date} ${data.event.month_year}<br>${data.event.hero_location}`
  );
  $(".hero").css(
    "background",
    `linear-gradient(rgba(47, 62, 70, 0.4), rgba(47, 62, 70, 0.6)), url("${fixtures.images.hero}") no-repeat`
  );
  $(".hero").css("background-size", "cover");

  // Update Navigation
  $("#nav-waktu, #nav-desktop-waktu, #nav-floating-waktu").text(data.ui.nav.waktu);
  $("#nav-floating-home").text(data.ui.nav.home);
  $("#nav-lokasi, #nav-desktop-lokasi, #nav-floating-lokasi").text(data.ui.nav.lokasi);
  $("#nav-tentang, #nav-desktop-tentang, #nav-floating-tentang").text(data.ui.nav.tentang);
  $("#nav-rsvp, #nav-desktop-rsvp, #nav-floating-rsvp").text(data.ui.nav.rsvp);
  $("#nav-desktop-home").text(data.ui.nav.home);

  // Update Main Message
  $("#main-message").html(data.ui.main_message);

  // Update Couple Names - #couple-names-header is the real element in the hero
  $("#couple-names-header").text(`${data.couple.bride_full_name} & ${data.couple.groom_full_name}`);

  // Update Couple Names in the main section (#regular-section)
  $("#bride-name").text(data.couple.bride_full_name);
  $("#groom-name").text(data.couple.groom_full_name);
  
  // Initialize scroll-based animation observer
  initAnimationObserver();

  // Update Event Section (Cuándo)
  $("#title-waktu").text(data.ui.section_titles.waktu);
  $("#event-day").text(data.event.day);
  $("#event-date").text(data.event.date);
  $("#event-month-year").text(data.event.month_year);
  $("#event-time").text(data.event.event_time);

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
  $("#whatsapp-confirm-label").text(data.ui.labels.rsvp_confirm);
  $("#social-footer-label").text(data.ui.labels.social_footer);

  var waTextConfirm = encodeURIComponent(
    "\u00a1Hola! Quiero confirmar mi asistencia a la boda de " + data.couple.bride + " y " + data.couple.groom + ". \uD83C\uDF89"
  );
  $("#whatsapp-confirm").attr(
    "href",
    "https://api.whatsapp.com/send?phone=" + fixtures.links.whatsapp_bride + "&text=" + waTextConfirm
  );

  // Initialize Countdown

  // Initialize Countdown
  if ($("#hitungmundur").length > 0) {
    $("#hitungmundur").countdown({
      date: data.event.full_date,
      offset: -3,
      day: "Día",
      days: "Días"
    });
  }
}

function prepareAnimatedText(selector, text, animationClass) {
  const container = $(selector);
  container.addClass(animationClass).empty();
  
  const words = text.split(" ");
  words.forEach((word, i) => {
    const span = $("<span></span>").text(word);
    span.css("transition-delay", (i * 0.3) + "s");
    container.append(span);
  });
}

function triggerHomeTypingAnimation() {
  // Reset the .typing CSS animation so it plays from the start
  const typingEls = $('.typing');
  typingEls.removeClass('animate');
  setTimeout(() => {
    typingEls.addClass('animate');
  }, 80);
}

function initAnimationObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $(entry.target).addClass("animate");
      } else {
        $(entry.target).removeClass("animate");
      }
    });
  }, { threshold: 0.1 });

  // Only observe word-by-word elements — .typing is controlled via triggerHomeTypingAnimation()
  $(".word-by-word").each(function() {
    observer.observe(this);
  });
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

// Floral Dividers Animation
document.addEventListener("DOMContentLoaded", function() {
  const floralDividers = document.querySelectorAll('.floral-divider');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('sway');
        } else {
          entry.target.classList.remove('sway');
        }
      });
    }, { threshold: 0.1 });

    floralDividers.forEach(divider => observer.observe(divider));
  } else {
    // Fallback for older browsers
  }
});
