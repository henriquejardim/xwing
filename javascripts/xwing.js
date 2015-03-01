
/*
    X-Wing Squad Builder
    Geordan Rosario <geordan@gmail.com>
    https://github.com/geordanr/xwing
 */

(function() {
  var GenericAddon, SERIALIZATION_CODE_TO_CLASS, SQUAD_DISPLAY_NAME_MAX_LENGTH, Ship, exportObj, statAndEffectiveStat,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.iced = {
    Deferrals: (function() {
      function _Class(_arg) {
        this.continuation = _arg;
        this.count = 1;
        this.ret = null;
      }

      _Class.prototype._fulfill = function() {
        if (!--this.count) {
          return this.continuation(this.ret);
        }
      };

      _Class.prototype.defer = function(defer_params) {
        ++this.count;
        return (function(_this) {
          return function() {
            var inner_params, _ref;
            inner_params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            if (defer_params != null) {
              if ((_ref = defer_params.assign_fn) != null) {
                _ref.apply(null, inner_params);
              }
            }
            return _this._fulfill();
          };
        })(this);
      };

      return _Class;

    })(),
    findDeferral: function() {
      return null;
    },
    trampoline: function(_fn) {
      return _fn();
    }
  };
  window.__iced_k = window.__iced_k_noop = function() {};

  exportObj = typeof exports !== "undefined" && exports !== null ? exports : this;

  exportObj.sortHelper = function(a, b) {
    var a_name, b_name;
    if (a.points === b.points) {
      a_name = a.text.replace(/[^a-z0-9]/ig, '');
      b_name = b.text.replace(/[^a-z0-9]/ig, '');
      if (a_name === b_name) {
        return 0;
      } else {
        if (a_name > b_name) {
          return 1;
        } else {
          return -1;
        }
      }
    } else {
      if (a.points > b.points) {
        return 1;
      } else {
        return -1;
      }
    }
  };

  $.isMobile = function() {
    return navigator.userAgent.match(/(iPhone|iPod|iPad|Android)/i);
  };

  $.randomInt = function(n) {
    return Math.floor(Math.random() * n);
  };

  $.getParameterByName = function(name) {
    var regex, regexS, results;
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    regexS = "[\\?&]" + name + "=([^&#]*)";
    regex = new RegExp(regexS);
    results = regex.exec(window.location.search);
    if (results === null) {
      return "";
    } else {
      return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
  };

  Array.prototype.intersects = function(other) {
    var item, _i, _len;
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      item = this[_i];
      if (__indexOf.call(other, item) >= 0) {
        return true;
      }
    }
    return false;
  };

  Array.prototype.removeItem = function(item) {
    var idx;
    idx = this.indexOf(item);
    if (idx !== -1) {
      this.splice(idx, 1);
    }
    return this;
  };

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

  SQUAD_DISPLAY_NAME_MAX_LENGTH = 24;

  statAndEffectiveStat = function(base_stat, effective_stats, key) {
    return "" + base_stat + (effective_stats[key] !== base_stat ? " (" + effective_stats[key] + ")" : "");
  };

  exportObj.SquadBuilder = (function() {
    function SquadBuilder(args) {
      this._makeRandomizerLoopFunc = __bind(this._makeRandomizerLoopFunc, this);
      this._randomizerLoopBody = __bind(this._randomizerLoopBody, this);
      this.releaseUnique = __bind(this.releaseUnique, this);
      this.claimUnique = __bind(this.claimUnique, this);
      this.onSquadNameChanged = __bind(this.onSquadNameChanged, this);
      this.onSquadDirtinessChanged = __bind(this.onSquadDirtinessChanged, this);
      this.onSquadLoadRequested = __bind(this.onSquadLoadRequested, this);
      this.onPointsUpdated = __bind(this.onPointsUpdated, this);
      this.onGameTypeChanged = __bind(this.onGameTypeChanged, this);
      this.onNotesUpdated = __bind(this.onNotesUpdated, this);
      this.container = $(args.container);
      this.faction = $.trim(args.faction);
      this.printable_container = $(args.printable_container);
      this.tab = $(args.tab);
      this.ships = [];
      this.uniques_in_use = {
        Pilot: [],
        Upgrade: [],
        Modification: [],
        Title: []
      };
      this.suppress_automatic_new_ship = false;
      this.tooltip_currently_displaying = null;
      this.randomizer_options = {
        sources: null,
        points: 100
      };
      this.total_points = 0;
      this.isCustom = false;
      this.isEpic = false;
      this.maxEpicPointsAllowed = 0;
      this.maxSmallShipsOfOneType = null;
      this.maxLargeShipsOfOneType = null;
      this.backend = null;
      this.current_squad = {};
      this.language = 'English';
      this.collection = null;
      this.setupUI();
      this.setupEventHandlers();
      this.resetCurrentSquad();
      if ($.getParameterByName('f') === this.faction) {
        this.loadFromSerialized($.getParameterByName('d'));
      } else {
        this.addShip();
      }
    }

    SquadBuilder.prototype.resetCurrentSquad = function() {
      this.current_squad = {
        id: null,
        name: $.trim(this.squad_name_input.val()) || "Unnamed Squadron",
        dirty: false,
        additional_data: {
          points: this.total_points,
          description: '',
          cards: [],
          notes: ''
        },
        faction: this.faction
      };
      if (this.total_points > 0) {
        this.current_squad.name = 'Unsaved Squadron';
        this.current_squad.dirty = true;
      }
      this.container.trigger('xwing-backend:squadNameChanged');
      return this.container.trigger('xwing-backend:squadDirtinessChanged');
    };

    SquadBuilder.prototype.newSquadFromScratch = function() {
      this.squad_name_input.val('New Squadron');
      this.removeAllShips();
      this.addShip();
      this.resetCurrentSquad();
      return this.notes.val('');
    };

    SquadBuilder.prototype.setupUI = function() {
      var DEFAULT_RANDOMIZER_ITERATIONS, DEFAULT_RANDOMIZER_POINTS, DEFAULT_RANDOMIZER_TIMEOUT_SEC, content_container, expansion, opt, _i, _len, _ref;
      DEFAULT_RANDOMIZER_POINTS = 100;
      DEFAULT_RANDOMIZER_TIMEOUT_SEC = 2;
      DEFAULT_RANDOMIZER_ITERATIONS = 1000;
      this.status_container = $(document.createElement('DIV'));
      this.status_container.addClass('container-fluid');
      this.status_container.append($.trim('<div class="row-fluid">\n    <div class="span3 squad-name-container">\n        <div class="display-name">\n            <span class="squad-name"></span>\n            <i class="icon-pencil"></i>\n        </div>\n        <div class="input-append">\n            <input type="text" maxlength="64" placeholder="Name your squad..." />\n            <button class="btn save"><i class="icon-edit"></i></button>\n        </div>\n    </div>\n    <div class="span4 points-display-container">\n        Points: <span class="total-points">0</span> / <input type="number" class="desired-points" value="100">\n        <select class="game-type-selector">\n            <option value="standard">Standard</option>\n            <option value="epic">Epic</option>\n            <option value="team-epic">Team Epic</option>\n            <option value="custom">Custom</option>\n        </select>\n        <span class="points-remaining-container">(<span class="points-remaining"></span>&nbsp;left)</span>\n        <span class="total-epic-points-container hidden"><br /><span class="total-epic-points">0</span> / <span class="max-epic-points">5</span> Epic Points</span>\n        <span class="content-warning unreleased-content-used hidden"><br /><i class="icon-exclamation-sign"></i>&nbsp;This squad uses unreleased content!</span>\n        <span class="content-warning epic-content-used hidden"><br /><i class="icon-exclamation-sign"></i>&nbsp;This squad uses Epic content!</span>\n        <span class="content-warning illegal-epic-upgrades hidden"><br /><i class="icon-exclamation-sign"></i>&nbsp;Navigator cannot be equipped onto Huge ships in Epic tournament play!</span>\n        <span class="content-warning illegal-epic-too-many-small-ships hidden"><br /><i class="icon-exclamation-sign"></i>&nbsp;You may not field more than 12 of the same type Small ship!</span>\n        <span class="content-warning illegal-epic-too-many-large-ships hidden"><br /><i class="icon-exclamation-sign"></i>&nbsp;You may not field more than 6 of the same type Large ship!</span>\n        <span class="content-warning collection-invalid hidden"><br /><i class="icon-exclamation-sign"></i>&nbsp;You cannot field this list with your collection!</span>\n    </div>\n    <div class="span5 pull-right button-container">\n        <div class="btn-group pull-right">\n\n            <button class="btn btn-primary view-as-text"><span class="hidden-phone"><i class="icon-print"></i>&nbsp;Print/View as </span>Text</button>\n            <!-- <button class="btn btn-primary print-list hidden-phone hidden-tablet"><i class="icon-print"></i>&nbsp;Print</button> -->\n            <a class="btn btn-primary hidden collection"><i class="icon-folder-open hidden-phone hidden-tabler"></i>&nbsp;Your Collection</a>\n            <a class="btn btn-primary permalink"><i class="icon-link hidden-phone hidden-tablet"></i>&nbsp;Permalink</a>\n\n            <!--\n            <button class="btn btn-primary randomize" ><i class="icon-random hidden-phone hidden-tablet"></i>&nbsp;Random!</button>\n            <button class="btn btn-primary dropdown-toggle" data-toggle="dropdown">\n                <span class="caret"></span>\n            </button>\n            <ul class="dropdown-menu">\n                <li><a class="randomize-options">Randomizer Options...</a></li>\n            </ul>\n            -->\n\n        </div>\n    </div>\n</div>\n\n<div class="row-fluid style="display: none;">\n    <div class="span12">\n        <button class="show-authenticated btn btn-primary save-list"><i class="icon-save"></i>&nbsp;Save</button>\n        <button class="show-authenticated btn btn-primary save-list-as"><i class="icon-copy"></i>&nbsp;Save As...</button>\n        <button class="show-authenticated btn btn-primary delete-list disabled"><i class="icon-trash"></i>&nbsp;Delete</button>\n        <button class="show-authenticated btn btn-primary backend-list-my-squads show-authenticated">Load Squad</button>\n        <button class="btn btn-danger clear-squad">New Squad</button>\n        <span class="show-authenticated backend-status"></span>\n    </div>\n</div>'));
      this.container.append(this.status_container);
      this.list_modal = $(document.createElement('DIV'));
      this.list_modal.addClass('modal hide fade text-list-modal');
      this.container.append(this.list_modal);
      this.list_modal.append($.trim("<div class=\"modal-header\">\n    <button type=\"button\" class=\"close hidden-print\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n\n    <div class=\"hidden-phone hidden-print\">\n        <div class=\"fancy-header\">\n            <div class=\"squad-name\"></div>\n            <div class=\"mask\">\n                <div class=\"outer-circle\">\n                    <div class=\"inner-circle\">\n                        <span class=\"total-points\"></span>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class=\"fancy-under-header\"></div>\n    </div>\n\n    <div class=\"visible-print\">\n        <div class=\"fancy-header\">\n            <div class=\"squad-name\"></div>\n            <div class=\"mask\">\n                <div class=\"outer-circle\">\n                    <div class=\"inner-circle\">\n                        <span class=\"total-points\"></span>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div class=\"fancy-under-header\"></div>\n    </div>\n\n    <div class=\"visible-phone hidden-print\">\n        <h4><span class=\"squad-name\"></span> (<span class=\"total-points\"></span>)<h4>\n    </div>\n\n</div>\n<div class=\"modal-body\">\n    <div class=\"fancy-list hidden-phone\"></div>\n    <div class=\"simple-list\"></div>\n    <div class=\"bbcode-list\">\n        Copy the BBCode below and paste it into your forum post.\n        <textarea></textarea>\n    </div>\n</div>\n<div class=\"modal-footer hidden-print\">\n    <label class=\"vertical-space-checkbox\">\n        Add space for damage/upgrade cards when printing <input type=\"checkbox\" class=\"toggle-vertical-space\" />\n    </label>\n    <label class=\"color-print-checkbox\">\n        Print color <input type=\"checkbox\" class=\"toggle-color-print\" />\n    </label>\n    <div class=\"btn-group list-display-mode\">\n        <button class=\"btn select-simple-view\">Simple</button>\n        <button class=\"btn select-fancy-view hidden-phone\">Fancy</button>\n        <button class=\"btn select-bbcode-view\">BBCode</button>\n    </div>\n    <button class=\"btn print-list hidden-phone\"><i class=\"icon-print\"></i>&nbsp;Print</button>\n    <button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n</div>"));
      this.fancy_container = $(this.list_modal.find('div.modal-body .fancy-list'));
      this.fancy_total_points_container = $(this.list_modal.find('div.modal-header .total-points'));
      this.simple_container = $(this.list_modal.find('div.modal-body .simple-list'));
      this.bbcode_container = $(this.list_modal.find('div.modal-body .bbcode-list'));
      this.bbcode_textarea = $(this.bbcode_container.find('textarea'));
      this.bbcode_textarea.attr('readonly', 'readonly');
      this.toggle_vertical_space_container = $(this.list_modal.find('.vertical-space-checkbox'));
      this.toggle_color_print_container = $(this.list_modal.find('.color-print-checkbox'));
      this.select_simple_view_button = $(this.list_modal.find('.select-simple-view'));
      this.select_simple_view_button.click((function(_this) {
        return function(e) {
          _this.select_simple_view_button.blur();
          if (_this.list_display_mode !== 'simple') {
            _this.list_modal.find('.list-display-mode .btn').removeClass('btn-inverse');
            _this.select_simple_view_button.addClass('btn-inverse');
            _this.list_display_mode = 'simple';
            _this.simple_container.show();
            _this.fancy_container.hide();
            _this.bbcode_container.hide();
            _this.toggle_vertical_space_container.hide();
            return _this.toggle_color_print_container.hide();
          }
        };
      })(this));
      this.select_fancy_view_button = $(this.list_modal.find('.select-fancy-view'));
      this.select_fancy_view_button.click((function(_this) {
        return function(e) {
          _this.select_fancy_view_button.blur();
          if (_this.list_display_mode !== 'fancy') {
            _this.list_modal.find('.list-display-mode .btn').removeClass('btn-inverse');
            _this.select_fancy_view_button.addClass('btn-inverse');
            _this.list_display_mode = 'fancy';
            _this.fancy_container.show();
            _this.simple_container.hide();
            _this.bbcode_container.hide();
            _this.toggle_vertical_space_container.show();
            return _this.toggle_color_print_container.show();
          }
        };
      })(this));
      this.select_bbcode_view_button = $(this.list_modal.find('.select-bbcode-view'));
      this.select_bbcode_view_button.click((function(_this) {
        return function(e) {
          _this.select_bbcode_view_button.blur();
          if (_this.list_display_mode !== 'bbcode') {
            _this.list_modal.find('.list-display-mode .btn').removeClass('btn-inverse');
            _this.select_bbcode_view_button.addClass('btn-inverse');
            _this.list_display_mode = 'bbcode';
            _this.bbcode_container.show();
            _this.simple_container.hide();
            _this.fancy_container.hide();
            _this.bbcode_textarea.select();
            _this.bbcode_textarea.focus();
            _this.toggle_vertical_space_container.show();
            return _this.toggle_color_print_container.show();
          }
        };
      })(this));
      if ($(window).width() >= 768) {
        this.simple_container.hide();
        this.select_fancy_view_button.click();
      } else {
        this.select_simple_view_button.click();
      }
      this.clear_squad_button = $(this.status_container.find('.clear-squad'));
      this.clear_squad_button.click((function(_this) {
        return function(e) {
          if (_this.current_squad.dirty && (_this.backend != null)) {
            return _this.backend.warnUnsaved(_this, function() {
              return _this.newSquadFromScratch();
            });
          } else {
            return _this.newSquadFromScratch();
          }
        };
      })(this));
      this.squad_name_container = $(this.status_container.find('div.squad-name-container'));
      this.squad_name_display = $(this.container.find('.display-name'));
      this.squad_name_placeholder = $(this.container.find('.squad-name'));
      this.squad_name_input = $(this.squad_name_container.find('input'));
      this.squad_name_save_button = $(this.squad_name_container.find('button.save'));
      this.squad_name_input.closest('div').hide();
      this.points_container = $(this.status_container.find('div.points-display-container'));
      this.total_points_span = $(this.points_container.find('.total-points'));
      this.game_type_selector = $(this.status_container.find('.game-type-selector'));
      this.game_type_selector.change((function(_this) {
        return function(e) {
          return _this.onGameTypeChanged(_this.game_type_selector.val());
        };
      })(this));
      this.desired_points_input = $(this.points_container.find('.desired-points'));
      this.desired_points_input.change((function(_this) {
        return function(e) {
          _this.game_type_selector.val('custom');
          return _this.onGameTypeChanged('custom');
        };
      })(this));
      this.points_remaining_span = $(this.points_container.find('.points-remaining'));
      this.points_remaining_container = $(this.points_container.find('.points-remaining-container'));
      this.unreleased_content_used_container = $(this.points_container.find('.unreleased-content-used'));
      this.epic_content_used_container = $(this.points_container.find('.epic-content-used'));
      this.illegal_epic_upgrades_container = $(this.points_container.find('.illegal-epic-upgrades'));
      this.too_many_small_ships_container = $(this.points_container.find('.illegal-epic-too-many-small-ships'));
      this.too_many_large_ships_container = $(this.points_container.find('.illegal-epic-too-many-large-ships'));
      this.collection_invalid_container = $(this.points_container.find('.collection-invalid'));
      this.total_epic_points_container = $(this.points_container.find('.total-epic-points-container'));
      this.total_epic_points_span = $(this.total_epic_points_container.find('.total-epic-points'));
      this.max_epic_points_span = $(this.points_container.find('.max-epic-points'));
      this.permalink = $(this.status_container.find('div.button-container a.permalink'));
      this.view_list_button = $(this.status_container.find('div.button-container button.view-as-text'));
      this.randomize_button = $(this.status_container.find('div.button-container button.randomize'));
      this.customize_randomizer = $(this.status_container.find('div.button-container a.randomize-options'));
      this.backend_status = $(this.status_container.find('.backend-status'));
      this.backend_status.hide();
      this.collection_button = $(this.status_container.find('div.button-container a.collection'));
      this.collection_button.click((function(_this) {
        return function(e) {
          e.preventDefault();
          if (!_this.collection_button.prop('disabled')) {
            return _this.collection.modal.modal('show');
          }
        };
      })(this));
      this.squad_name_input.keypress((function(_this) {
        return function(e) {
          if (e.which === 13) {
            _this.squad_name_save_button.click();
            return false;
          }
        };
      })(this));
      this.squad_name_input.change((function(_this) {
        return function(e) {
          return _this.backend_status.fadeOut('slow');
        };
      })(this));
      this.squad_name_input.blur((function(_this) {
        return function(e) {
          _this.squad_name_input.change();
          return _this.squad_name_save_button.click();
        };
      })(this));
      this.squad_name_display.click((function(_this) {
        return function(e) {
          e.preventDefault();
          _this.squad_name_display.hide();
          _this.squad_name_input.val($.trim(_this.current_squad.name));
          window.setTimeout(function() {
            _this.squad_name_input.focus();
            return _this.squad_name_input.select();
          }, 100);
          return _this.squad_name_input.closest('div').show();
        };
      })(this));
      this.squad_name_save_button.click((function(_this) {
        return function(e) {
          var name;
          e.preventDefault();
          _this.current_squad.dirty = true;
          _this.container.trigger('xwing-backend:squadDirtinessChanged');
          name = _this.current_squad.name = $.trim(_this.squad_name_input.val());
          if (name.length > 0) {
            _this.squad_name_display.show();
            _this.container.trigger('xwing-backend:squadNameChanged');
            return _this.squad_name_input.closest('div').hide();
          }
        };
      })(this));
      this.randomizer_options_modal = $(document.createElement('DIV'));
      this.randomizer_options_modal.addClass('modal hide fade');
      $('body').append(this.randomizer_options_modal);
      this.randomizer_options_modal.append($.trim("<div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\n    <h3>Random Squad Builder Options</h3>\n</div>\n<div class=\"modal-body\">\n    <form>\n        <label>\n            Desired Points\n            <input type=\"number\" class=\"randomizer-points\" value=\"" + DEFAULT_RANDOMIZER_POINTS + "\" placeholder=\"" + DEFAULT_RANDOMIZER_POINTS + "\" />\n        </label>\n        <label>\n            Sets and Expansions (default all)\n            <select class=\"randomizer-sources\" multiple=\"1\" data-placeholder=\"Use all sets and expansions\">\n            </select>\n        </label>\n        <label>\n            Maximum Seconds to Spend Randomizing\n            <input type=\"number\" class=\"randomizer-timeout\" value=\"" + DEFAULT_RANDOMIZER_TIMEOUT_SEC + "\" placeholder=\"" + DEFAULT_RANDOMIZER_TIMEOUT_SEC + "\" />\n        </label>\n        <label>\n            Maximum Randomization Iterations\n            <input type=\"number\" class=\"randomizer-iterations\" value=\"" + DEFAULT_RANDOMIZER_ITERATIONS + "\" placeholder=\"" + DEFAULT_RANDOMIZER_ITERATIONS + "\" />\n        </label>\n    </form>\n</div>\n<div class=\"modal-footer\">\n    <button class=\"btn btn-primary do-randomize\" aria-hidden=\"true\">Randomize!</button>\n    <button class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Close</button>\n</div>"));
      this.randomizer_source_selector = $(this.randomizer_options_modal.find('select.randomizer-sources'));
      _ref = exportObj.expansions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        expansion = _ref[_i];
        opt = $(document.createElement('OPTION'));
        opt.text(expansion);
        this.randomizer_source_selector.append(opt);
      }
      this.randomizer_source_selector.select2({
        width: "100%",
        minimumResultsForSearch: $.isMobile() ? -1 : 0
      });
      this.randomize_button.click((function(_this) {
        return function(e) {
          var iterations, points, timeout_sec;
          e.preventDefault();
          if (_this.current_squad.dirty && (_this.backend != null)) {
            return _this.backend.warnUnsaved(_this, function() {
              return _this.randomize_button.click();
            });
          } else {
            points = parseInt($(_this.randomizer_options_modal.find('.randomizer-points')).val());
            if (isNaN(points) || points <= 0) {
              points = DEFAULT_RANDOMIZER_POINTS;
            }
            timeout_sec = parseInt($(_this.randomizer_options_modal.find('.randomizer-timeout')).val());
            if (isNaN(timeout_sec) || timeout_sec <= 0) {
              timeout_sec = DEFAULT_RANDOMIZER_TIMEOUT_SEC;
            }
            iterations = parseInt($(_this.randomizer_options_modal.find('.randomizer-iterations')).val());
            if (isNaN(iterations) || iterations <= 0) {
              iterations = DEFAULT_RANDOMIZER_ITERATIONS;
            }
            return _this.randomSquad(points, _this.randomizer_source_selector.val(), DEFAULT_RANDOMIZER_TIMEOUT_SEC * 1000, iterations);
          }
        };
      })(this));
      this.randomizer_options_modal.find('button.do-randomize').click((function(_this) {
        return function(e) {
          e.preventDefault();
          _this.randomizer_options_modal.modal('hide');
          return _this.randomize_button.click();
        };
      })(this));
      this.customize_randomizer.click((function(_this) {
        return function(e) {
          e.preventDefault();
          return _this.randomizer_options_modal.modal();
        };
      })(this));
      this.backend_list_squads_button = $(this.container.find('button.backend-list-my-squads'));
      this.backend_list_squads_button.click((function(_this) {
        return function(e) {
          e.preventDefault();
          if (_this.backend != null) {
            return _this.backend.list(_this);
          }
        };
      })(this));
      this.backend_save_list_button = $(this.container.find('button.save-list'));
      this.backend_save_list_button.click((function(_this) {
        return function(e) {
          var additional_data, results, ___iced_passed_deferral, __iced_deferrals, __iced_k;
          __iced_k = __iced_k_noop;
          ___iced_passed_deferral = iced.findDeferral(arguments);
          e.preventDefault();
          if ((_this.backend != null) && !_this.backend_save_list_button.hasClass('disabled')) {
            additional_data = {
              points: _this.total_points,
              description: _this.describeSquad(),
              cards: _this.listCards(),
              notes: _this.notes.val().substr(0, 1024)
            };
            _this.backend_status.html($.trim("<i class=\"icon-refresh icon-spin\"></i>&nbsp;Saving squad..."));
            _this.backend_status.show();
            _this.backend_save_list_button.addClass('disabled');
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "coffeescripts/xwing.coffee"
              });
              _this.backend.save(_this.serialize(), _this.current_squad.id, _this.current_squad.name, _this.faction, additional_data, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return results = arguments[0];
                  };
                })(),
                lineno: 490
              }));
              __iced_deferrals._fulfill();
            })(function() {
              return __iced_k(results.success ? (_this.current_squad.dirty = false, _this.current_squad.id != null ? _this.backend_status.html($.trim("<i class=\"icon-ok\"></i>&nbsp;Squad updated successfully.")) : (_this.backend_status.html($.trim("<i class=\"icon-ok\"></i>&nbsp;New squad saved successfully.")), _this.current_squad.id = results.id), _this.container.trigger('xwing-backend:squadDirtinessChanged')) : (_this.backend_status.html($.trim("<i class=\"icon-exclamation-sign\"></i>&nbsp;" + results.error)), _this.backend_save_list_button.removeClass('disabled')));
            });
          } else {
            return __iced_k();
          }
        };
      })(this));
      this.backend_save_list_as_button = $(this.container.find('button.save-list-as'));
      this.backend_save_list_as_button.addClass('disabled');
      this.backend_save_list_as_button.click((function(_this) {
        return function(e) {
          e.preventDefault();
          if ((_this.backend != null) && !_this.backend_save_list_as_button.hasClass('disabled')) {
            return _this.backend.showSaveAsModal(_this);
          }
        };
      })(this));
      this.backend_delete_list_button = $(this.container.find('button.delete-list'));
      this.backend_delete_list_button.click((function(_this) {
        return function(e) {
          e.preventDefault();
          if ((_this.backend != null) && !_this.backend_delete_list_button.hasClass('disabled')) {
            return _this.backend.showDeleteModal(_this);
          }
        };
      })(this));
      content_container = $(document.createElement('DIV'));
      content_container.addClass('container-fluid');
      this.container.append(content_container);
      content_container.append($.trim("<div class=\"row-fluid\">\n    <div class=\"span9 ship-container\">\n                <label class=\"notes-container show-authenticated\">\n                    Squad Notes:\n                    <br />\n                    <textarea class=\"squad-notes\"></textarea>\n                </label>\n    </div>\n    <div class=\"span3 info-container\" />\n</div>"));
      this.ship_container = $(content_container.find('div.ship-container'));
      this.info_container = $(content_container.find('div.info-container'));
      this.notes_container = $(content_container.find('.notes-container'));
      this.notes = $(this.notes_container.find('textarea.squad-notes'));
      this.info_container.append($.trim("<div class=\"well well-small info-well\">\n    <span class=\"info-name\"></span>\n    <br />\n    <span class=\"info-sources\"></span>\n    <table>\n        <tbody>\n            <tr class=\"info-ship\">\n                <td class=\"info-header\">Ship</td>\n                <td class=\"info-data\"></td>\n            </tr>\n            <tr class=\"info-skill\">\n                <td class=\"info-header\">Skill</td>\n                <td class=\"info-data info-skill\"></td>\n            </tr>\n            <tr class=\"info-energy\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font xwing-miniatures-font-energy\"></i></td>\n                <td class=\"info-data info-energy\"></td>\n            </tr>\n            <tr class=\"info-attack\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font xwing-miniatures-font-attack\"></i></td>\n                <td class=\"info-data info-attack\"></td>\n            </tr>\n            <tr class=\"info-range\">\n                <td class=\"info-header\">Range</td>\n                <td class=\"info-data info-range\"></td>\n            </tr>\n            <tr class=\"info-agility\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font xwing-miniatures-font-agility\"></i></td>\n                <td class=\"info-data info-agility\"></td>\n            </tr>\n            <tr class=\"info-hull\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font xwing-miniatures-font-hull\"></i></td>\n                <td class=\"info-data info-hull\"></td>\n            </tr>\n            <tr class=\"info-shields\">\n                <td class=\"info-header\"><i class=\"xwing-miniatures-font xwing-miniatures-font-shield\"></i></td>\n                <td class=\"info-data info-shields\"></td>\n            </tr>\n            <tr class=\"info-actions\">\n                <td class=\"info-header\">Actions</td>\n                <td class=\"info-data\"></td>\n            </tr>\n            <tr class=\"info-upgrades\">\n                <td class=\"info-header\">Upgrades</td>\n                <td class=\"info-data\"></td>\n            </tr>\n        </tbody>\n    </table>\n    <p class=\"info-text\" />\n    <p class=\"info-maneuvers\" />\n</div>"));
      this.info_container.hide();
      this.print_list_button = $(this.container.find('button.print-list'));
      return this.container.find('[rel=tooltip]').tooltip();
    };

    SquadBuilder.prototype.setupEventHandlers = function() {
      this.container.on('xwing:claimUnique', (function(_this) {
        return function(e, unique, type, cb) {
          return _this.claimUnique(unique, type, cb);
        };
      })(this)).on('xwing:releaseUnique', (function(_this) {
        return function(e, unique, type, cb) {
          return _this.releaseUnique(unique, type, cb);
        };
      })(this)).on('xwing:pointsUpdated', (function(_this) {
        return function(e, cb) {
          if (cb == null) {
            cb = $.noop;
          }
          return _this.onPointsUpdated(cb);
        };
      })(this)).on('xwing-backend:squadLoadRequested', (function(_this) {
        return function(e, squad) {
          return _this.onSquadLoadRequested(squad);
        };
      })(this)).on('xwing-backend:squadDirtinessChanged', (function(_this) {
        return function(e) {
          return _this.onSquadDirtinessChanged();
        };
      })(this)).on('xwing-backend:squadNameChanged', (function(_this) {
        return function(e) {
          return _this.onSquadNameChanged();
        };
      })(this)).on('xwing:beforeLanguageLoad', (function(_this) {
        return function(e, cb) {
          if (cb == null) {
            cb = $.noop;
          }
          _this.pretranslation_serialized = _this.serialize();
          _this.removeAllShips();
          return cb();
        };
      })(this)).on('xwing:afterLanguageLoad', (function(_this) {
        return function(e, language, cb) {
          var ship, _i, _len, _ref;
          if (cb == null) {
            cb = $.noop;
          }
          _this.language = language;
          _this.loadFromSerialized(_this.pretranslation_serialized);
          _ref = _this.ships;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            ship = _ref[_i];
            ship.updateSelections();
          }
          _this.pretranslation_serialized = void 0;
          return cb();
        };
      })(this)).on('xwing:shipUpdated', (function(_this) {
        return function(e, cb) {
          var all_allocated, ship, _i, _len, _ref;
          if (cb == null) {
            cb = $.noop;
          }
          all_allocated = true;
          _ref = _this.ships;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            ship = _ref[_i];
            ship.updateSelections();
            if (ship.ship_selector.val() === '') {
              all_allocated = false;
            }
          }
          if (all_allocated && !_this.suppress_automatic_new_ship) {
            return _this.addShip();
          }
        };
      })(this));
      $(window).on('xwing-backend:authenticationChanged', (function(_this) {
        return function(e) {
          return _this.resetCurrentSquad();
        };
      })(this)).on('xwing-collection:created', (function(_this) {
        return function(e, collection) {
          _this.collection = collection;
          _this.collection.onLanguageChange(null, _this.language);
          _this.checkCollection();
          return _this.collection_button.removeClass('hidden');
        };
      })(this)).on('xwing-collection:changed', (function(_this) {
        return function(e, collection) {
          return _this.checkCollection();
        };
      })(this)).on('xwing-collection:destroyed', (function(_this) {
        return function(e, collection) {
          return _this.collection_button.addClass('hidden');
        };
      })(this)).on('xwing:pingActiveBuilder', (function(_this) {
        return function(e, cb) {
          if (_this.container.is(':visible')) {
            return cb(_this);
          }
        };
      })(this)).on('xwing:activateBuilder', (function(_this) {
        return function(e, faction, cb) {
          if (faction === _this.faction) {
            _this.tab.tab('show');
            return cb(_this);
          }
        };
      })(this));
      this.view_list_button.click((function(_this) {
        return function(e) {
          e.preventDefault();
          return _this.showTextListModal();
        };
      })(this));
      this.print_list_button.click((function(_this) {
        return function(e) {
          var ship, _i, _len, _ref;
          e.preventDefault();
          _this.printable_container.find('.printable-header').html(_this.list_modal.find('.modal-header').html());
          _this.printable_container.find('.printable-body').text('');
          switch (_this.list_display_mode) {
            case 'simple':
              _this.printable_container.find('.printable-body').html(_this.simple_container.html());
              break;
            default:
              _ref = _this.ships;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                ship = _ref[_i];
                if (ship.pilot != null) {
                  _this.printable_container.find('.printable-body').append(ship.toHTML());
                }
              }
              _this.printable_container.find('.fancy-ship').toggleClass('tall', _this.list_modal.find('.toggle-vertical-space').prop('checked'));
              _this.printable_container.find('.printable-body').toggleClass('bw', _this.list_modal.find('.toggle-print-color').prop('checked'));
          }
          if ($.trim(_this.notes.val()) !== '') {
            _this.printable_container.find('.printable-body').append($.trim("<h5 class=\"print-notes\">Notes:</h5>\n<pre class=\"print-notes\"></pre>"));
            _this.printable_container.find('.printable-body pre.print-notes').text(_this.notes.val());
          }
          return window.print();
        };
      })(this));
      $(window).resize((function(_this) {
        return function() {
          if ($(window).width() < 768 && _this.list_display_mode !== 'simple') {
            return _this.select_simple_view_button.click();
          }
        };
      })(this));
      this.notes.change(this.onNotesUpdated);
      return this.notes.on('keyup', this.onNotesUpdated);
    };

    SquadBuilder.prototype.onNotesUpdated = function() {
      if (this.total_points > 0) {
        this.current_squad.dirty = true;
        return this.container.trigger('xwing-backend:squadDirtinessChanged');
      }
    };

    SquadBuilder.prototype.onGameTypeChanged = function(gametype, cb) {
      if (cb == null) {
        cb = $.noop;
      }
      switch (gametype) {
        case 'standard':
          this.isEpic = false;
          this.isCustom = false;
          this.desired_points_input.val(100);
          this.maxSmallShipsOfOneType = null;
          this.maxLargeShipsOfOneType = null;
          break;
        case 'epic':
          this.isEpic = true;
          this.isCustom = false;
          this.maxEpicPointsAllowed = 5;
          this.desired_points_input.val(300);
          this.maxSmallShipsOfOneType = 12;
          this.maxLargeShipsOfOneType = 6;
          break;
        case 'team-epic':
          this.isEpic = true;
          this.isCustom = false;
          this.maxEpicPointsAllowed = 3;
          this.desired_points_input.val(200);
          this.maxSmallShipsOfOneType = 8;
          this.maxLargeShipsOfOneType = 4;
          break;
        case 'custom':
          this.isEpic = false;
          this.isCustom = true;
          this.maxSmallShipsOfOneType = null;
          this.maxLargeShipsOfOneType = null;
      }
      this.max_epic_points_span.text(this.maxEpicPointsAllowed);
      return this.onPointsUpdated(cb);
    };

    SquadBuilder.prototype.onPointsUpdated = function(cb) {
      var bbcode_ships, count, epic_content_used, i, illegal_for_epic, points_left, ship, shipCountsByType, ship_data, ship_name, ship_uses_epic_content, ship_uses_unreleased_content, unreleased_content_used, upgrade, _i, _j, _k, _l, _len, _len1, _len2, _len3, _name, _ref, _ref1, _ref2, _ref3, _ref4;
      if (cb == null) {
        cb = $.noop;
      }
      this.total_points = 0;
      this.total_epic_points = 0;
      unreleased_content_used = false;
      epic_content_used = false;
      _ref = this.ships;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        ship = _ref[i];
        ship.validate();
        this.total_points += ship.getPoints();
        this.total_epic_points += ship.getEpicPoints();
        ship_uses_unreleased_content = ship.checkUnreleasedContent();
        if (ship_uses_unreleased_content) {
          unreleased_content_used = ship_uses_unreleased_content;
        }
        ship_uses_epic_content = ship.checkEpicContent();
        if (ship_uses_epic_content) {
          epic_content_used = ship_uses_epic_content;
        }
      }
      this.total_points_span.text(this.total_points);
      points_left = parseInt(this.desired_points_input.val()) - this.total_points;
      this.points_remaining_span.text(points_left);
      this.points_remaining_container.toggleClass('red', points_left < 0);
      this.unreleased_content_used_container.toggleClass('hidden', !unreleased_content_used);
      this.epic_content_used_container.toggleClass('hidden', this.isEpic || !epic_content_used);
      this.illegal_epic_upgrades_container.toggleClass('hidden', true);
      this.too_many_small_ships_container.toggleClass('hidden', true);
      this.too_many_large_ships_container.toggleClass('hidden', true);
      this.total_epic_points_container.toggleClass('hidden', true);
      if (this.isEpic) {
        this.total_epic_points_container.toggleClass('hidden', false);
        this.total_epic_points_span.text(this.total_epic_points);
        this.total_epic_points_span.toggleClass('red', this.total_epic_points > this.maxEpicPointsAllowed);
        shipCountsByType = {};
        illegal_for_epic = false;
        _ref1 = this.ships;
        for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
          ship = _ref1[i];
          if ((ship != null ? ship.data : void 0) != null) {
            if (shipCountsByType[_name = ship.data.name] == null) {
              shipCountsByType[_name] = 0;
            }
            shipCountsByType[ship.data.name] += 1;
            if (ship.data.huge != null) {
              _ref2 = ship.upgrades;
              for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                upgrade = _ref2[_k];
                if ((upgrade != null ? (_ref3 = upgrade.data) != null ? _ref3.epic_restriction_func : void 0 : void 0) != null) {
                  if (!upgrade.data.epic_restriction_func(ship.data, upgrade)) {
                    illegal_for_epic = true;
                    break;
                  }
                }
                if (illegal_for_epic) {
                  break;
                }
              }
            }
          }
        }
        this.illegal_epic_upgrades_container.toggleClass('hidden', !illegal_for_epic);
        if ((this.maxLargeShipsOfOneType != null) && (this.maxSmallShipsOfOneType != null)) {
          for (ship_name in shipCountsByType) {
            count = shipCountsByType[ship_name];
            ship_data = exportObj.ships[ship_name];
            if ((ship_data.large != null) && count > this.maxLargeShipsOfOneType) {
              this.too_many_large_ships_container.toggleClass('hidden', false);
            } else if ((ship.huge == null) && count > this.maxSmallShipsOfOneType) {
              this.too_many_small_ships_container.toggleClass('hidden', false);
            }
          }
        }
      }
      this.fancy_total_points_container.text(this.total_points);
      this.permalink.attr('href', "" + (window.location.href.split('?')[0]) + "?f=" + (encodeURI(this.faction)) + "&d=" + (encodeURI(this.serialize())));
      this.fancy_container.text('');
      this.simple_container.html('<table class="simple-table"></table>');
      bbcode_ships = [];
      _ref4 = this.ships;
      for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
        ship = _ref4[_l];
        if (ship.pilot != null) {
          this.fancy_container.append(ship.toHTML());
          this.simple_container.find('table').append(ship.toTableRow());
          bbcode_ships.push(ship.toBBCode());
        }
      }
      this.bbcode_container.find('textarea').val($.trim("" + (bbcode_ships.join("\n\n")) + "\n\n[b][i]Total: " + this.total_points + "[/i][/b]\n\n[url=" + (this.permalink.attr('href')) + "]View in Yet Another Squad Builder[/url]"));
      this.checkCollection();
      return cb(this.total_points);
    };

    SquadBuilder.prototype.onSquadLoadRequested = function(squad) {
      var _ref;
      this.current_squad = squad;
      this.backend_delete_list_button.removeClass('disabled');
      this.squad_name_input.val(this.current_squad.name);
      this.squad_name_placeholder.text(this.current_squad.name);
      this.loadFromSerialized(squad.serialized);
      this.notes.val((_ref = squad.additional_data.notes) != null ? _ref : '');
      this.backend_status.fadeOut('slow');
      this.current_squad.dirty = false;
      return this.container.trigger('xwing-backend:squadDirtinessChanged');
    };

    SquadBuilder.prototype.onSquadDirtinessChanged = function() {
      this.backend_save_list_button.toggleClass('disabled', !(this.current_squad.dirty && this.total_points > 0));
      this.backend_save_list_as_button.toggleClass('disabled', this.total_points === 0);
      return this.backend_delete_list_button.toggleClass('disabled', this.current_squad.id == null);
    };

    SquadBuilder.prototype.onSquadNameChanged = function() {
      var short_name;
      if (this.current_squad.name.length > SQUAD_DISPLAY_NAME_MAX_LENGTH) {
        short_name = "" + (this.current_squad.name.substr(0, SQUAD_DISPLAY_NAME_MAX_LENGTH)) + "&hellip;";
      } else {
        short_name = this.current_squad.name;
      }
      this.squad_name_placeholder.text('');
      this.squad_name_placeholder.append(short_name);
      return this.squad_name_input.val(this.current_squad.name);
    };

    SquadBuilder.prototype.removeAllShips = function() {
      while (this.ships.length > 0) {
        this.removeShip(this.ships[0]);
      }
      if (this.ships.length > 0) {
        throw new Error("Ships not emptied");
      }
    };

    SquadBuilder.prototype.showTextListModal = function() {
      return this.list_modal.modal('show');
    };

    SquadBuilder.prototype.serialize = function() {
      var game_type_abbrev, serialization_version, ship;
      serialization_version = 3;
      game_type_abbrev = (function() {
        switch (this.game_type_selector.val()) {
          case 'standard':
            return 's';
          case 'epic':
            return 'e';
          case 'team-epic':
            return 't';
          case 'custom':
            return "c=" + ($.trim(this.desired_points_input.val()));
        }
      }).call(this);
      return "v" + serialization_version + "!" + game_type_abbrev + "!" + (((function() {
        var _i, _len, _ref, _results;
        _ref = this.ships;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ship = _ref[_i];
          if (ship.pilot != null) {
            _results.push(ship.toSerialized());
          }
        }
        return _results;
      }).call(this)).join(';'));
    };

    SquadBuilder.prototype.loadFromSerialized = function(serialized) {
      var game_type_abbrev, matches, new_ship, re, serialized_ship, serialized_ships, version, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
      this.suppress_automatic_new_ship = true;
      this.removeAllShips();
      re = /^v(\d+)!(.*)/;
      matches = re.exec(serialized);
      if (matches != null) {
        version = parseInt(matches[1]);
        switch (version) {
          case 3:
            _ref = matches[2].split('!'), game_type_abbrev = _ref[0], serialized_ships = _ref[1];
            switch (game_type_abbrev) {
              case 's':
                this.game_type_selector.val('standard');
                this.game_type_selector.change();
                break;
              case 'e':
                this.game_type_selector.val('epic');
                this.game_type_selector.change();
                break;
              case 't':
                this.game_type_selector.val('team-epic');
                this.game_type_selector.change();
                break;
              default:
                this.game_type_selector.val('custom');
                this.desired_points_input.val(parseInt(game_type_abbrev.split('=')[1]));
                this.desired_points_input.change();
            }
            _ref1 = serialized_ships.split(';');
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              serialized_ship = _ref1[_i];
              if (serialized_ship !== '') {
                new_ship = this.addShip();
                new_ship.fromSerialized(version, serialized_ship);
              }
            }
            break;
          case 2:
            _ref2 = matches[2].split(';');
            for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
              serialized_ship = _ref2[_j];
              if (serialized_ship !== '') {
                new_ship = this.addShip();
                new_ship.fromSerialized(version, serialized_ship);
              }
            }
        }
      } else {
        _ref3 = serialized.split(';');
        for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
          serialized_ship = _ref3[_k];
          if (serialized !== '') {
            new_ship = this.addShip();
            new_ship.fromSerialized(1, serialized_ship);
          }
        }
      }
      this.suppress_automatic_new_ship = false;
      return this.addShip();
    };

    SquadBuilder.prototype.uniqueIndex = function(unique, type) {
      if (!(type in this.uniques_in_use)) {
        throw new Error("Invalid unique type '" + type + "'");
      }
      return this.uniques_in_use[type].indexOf(unique);
    };

    SquadBuilder.prototype.claimUnique = function(unique, type, cb) {
      var crew, pilot, upgrade_alias, _i, _len, _ref, _ref1;
      if (this.uniqueIndex(unique, type) < 0) {
        if (type === 'Pilot') {
          crew = exportObj.upgradesByLocalizedName[unique.name];
          if ((crew != null) && ((crew != null ? crew.unique : void 0) != null)) {
            if (this.uniqueIndex(crew, 'Upgrade') < 0) {
              this.uniques_in_use['Upgrade'].push(crew);
            } else {
              throw new Error("Unique " + type + " '" + unique.name + "' already claimed as crew");
            }
          }
        } else if (type === 'Upgrade') {
          if (unique.slot === 'Crew') {
            pilot = exportObj.pilotsByLocalizedName[unique.name];
            if ((pilot != null) && ((pilot != null ? pilot.unique : void 0) != null)) {
              if (this.uniqueIndex(pilot, 'Pilot') < 0) {
                this.uniques_in_use['Pilot'].push(pilot);
              } else {
                throw new Error("Unique " + type + " '" + unique.name + "' already claimed as pilot");
              }
            }
          }
          _ref1 = (_ref = unique.aka) != null ? _ref : [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            upgrade_alias = _ref1[_i];
            this.uniques_in_use['Upgrade'].push(exportObj.upgrades[upgrade_alias]);
          }
        }
        this.uniques_in_use[type].push(unique);
      } else {
        throw new Error("Unique " + type + " '" + unique.name + "' already claimed");
      }
      return cb();
    };

    SquadBuilder.prototype.releaseUnique = function(unique, type, cb) {
      var alias_idx, crew, idx, pilot, upgrade_alias, _i, _len, _ref, _ref1;
      idx = this.uniqueIndex(unique, type);
      if (idx >= 0) {
        this.uniques_in_use[type].splice(idx, 1);
        if (type === 'Pilot') {
          crew = exportObj.upgradesByLocalizedName[unique.name];
          if ((crew != null) && ((crew != null ? crew.unique : void 0) != null)) {
            idx = this.uniqueIndex(crew, 'Upgrade');
            if (idx < 0) {
              throw new Error("Unique crew accompanying " + unique.name + " was not also claimed!");
            }
            this.uniques_in_use['Upgrade'].splice(idx, 1);
          }
        } else if (type === 'Upgrade') {
          if (unique.slot === 'Crew') {
            pilot = exportObj.pilotsByLocalizedName[unique.name];
            if ((pilot != null) && ((pilot != null ? pilot.unique : void 0) != null)) {
              idx = this.uniqueIndex(pilot, 'Pilot');
              if (idx < 0) {
                throw new Error("Unique pilot accompanying " + unique.name + " was not also claimed!");
              }
              this.uniques_in_use['Pilot'].splice(idx, 1);
            }
          }
          _ref1 = (_ref = unique.aka) != null ? _ref : [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            upgrade_alias = _ref1[_i];
            alias_idx = this.uniqueIndex(exportObj.upgrades[upgrade_alias], 'Upgrade');
            this.uniques_in_use['Upgrade'].splice(alias_idx, 1);
          }
        }
      } else {
        throw new Error("Unique " + type + " '" + unique.name + "' not in use");
      }
      return cb();
    };

    SquadBuilder.prototype.addShip = function() {
      var new_ship;
      new_ship = new Ship({
        builder: this,
        container: this.ship_container
      });
      this.ships.push(new_ship);
      return new_ship;
    };

    SquadBuilder.prototype.removeShip = function(ship) {
      var ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "coffeescripts/xwing.coffee",
            funcname: "SquadBuilder.removeShip"
          });
          ship.destroy(__iced_deferrals.defer({
            lineno: 971
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "coffeescripts/xwing.coffee",
              funcname: "SquadBuilder.removeShip"
            });
            _this.container.trigger('xwing:pointsUpdated', __iced_deferrals.defer({
              lineno: 972
            }));
            __iced_deferrals._fulfill();
          })(function() {
            _this.current_squad.dirty = true;
            return _this.container.trigger('xwing-backend:squadDirtinessChanged');
          });
        };
      })(this));
    };

    SquadBuilder.prototype.matcher = function(item, term) {
      return item.toUpperCase().indexOf(term.toUpperCase()) >= 0;
    };

    SquadBuilder.prototype.getAvailableShipsMatching = function(term) {
      var ship_data, ship_name, ships, _ref, _ref1;
      if (term == null) {
        term = '';
      }
      ships = [];
      _ref = exportObj.ships;
      for (ship_name in _ref) {
        ship_data = _ref[ship_name];
        if ((_ref1 = this.faction, __indexOf.call(ship_data.factions, _ref1) >= 0) && this.matcher(ship_data.name, term)) {
          if (!ship_data.huge || (this.isEpic || this.isCustom)) {
            ships.push({
              id: ship_data.name,
              text: ship_data.name,
              english_name: ship_data.english_name
            });
          }
        }
      }
      return ships.sort(exportObj.sortHelper);
    };

    SquadBuilder.prototype.getAvailablePilotsForShipIncluding = function(ship, include_pilot, term) {
      var available_faction_pilots, eligible_faction_pilots, pilot, pilot_name;
      if (term == null) {
        term = '';
      }
      available_faction_pilots = (function() {
        var _ref, _results;
        _ref = exportObj.pilotsByLocalizedName;
        _results = [];
        for (pilot_name in _ref) {
          pilot = _ref[pilot_name];
          if (((ship == null) || pilot.ship === ship) && pilot.faction === this.faction && this.matcher(pilot_name, term)) {
            _results.push(pilot);
          }
        }
        return _results;
      }).call(this);
      eligible_faction_pilots = (function() {
        var _results;
        _results = [];
        for (pilot_name in available_faction_pilots) {
          pilot = available_faction_pilots[pilot_name];
          if ((pilot.unique == null) || __indexOf.call(this.uniques_in_use['Pilot'], pilot) < 0) {
            _results.push(pilot);
          }
        }
        return _results;
      }).call(this);
      if ((include_pilot != null) && (include_pilot.unique != null) && this.matcher(include_pilot.name, term)) {
        eligible_faction_pilots.push(include_pilot);
      }
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = available_faction_pilots.length; _i < _len; _i++) {
          pilot = available_faction_pilots[_i];
          _results.push({
            id: pilot.id,
            text: "" + pilot.name + " (" + pilot.points + ")",
            points: pilot.points,
            ship: pilot.ship,
            english_name: pilot.english_name,
            disabled: __indexOf.call(eligible_faction_pilots, pilot) < 0
          });
        }
        return _results;
      })()).sort(exportObj.sortHelper);
    };

    SquadBuilder.prototype.getAvailableUpgradesIncluding = function(slot, include_upgrade, ship, this_upgrade_obj, term) {
      var available_upgrades, eligible_upgrades, equipped_upgrade, limited_upgrades_in_use, retval, upgrade, upgrade_name, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results;
      if (term == null) {
        term = '';
      }
      limited_upgrades_in_use = (function() {
        var _i, _len, _ref, _ref1, _results;
        _ref = ship.upgrades;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          upgrade = _ref[_i];
          if ((upgrade != null ? (_ref1 = upgrade.data) != null ? _ref1.limited : void 0 : void 0) != null) {
            _results.push(upgrade.data);
          }
        }
        return _results;
      })();
      available_upgrades = (function() {
        var _ref, _results;
        _ref = exportObj.upgradesByLocalizedName;
        _results = [];
        for (upgrade_name in _ref) {
          upgrade = _ref[upgrade_name];
          if (upgrade.slot === slot && this.matcher(upgrade_name, term) && ((upgrade.ship == null) || upgrade.ship === ship.data.name) && ((upgrade.faction == null) || upgrade.faction === this.faction) && ((this.isEpic || this.isCustom) || upgrade.restriction_func !== exportObj.hugeOnly)) {
            _results.push(upgrade);
          }
        }
        return _results;
      }).call(this);
      eligible_upgrades = (function() {
        var _results;
        _results = [];
        for (upgrade_name in available_upgrades) {
          upgrade = available_upgrades[upgrade_name];
          if (((upgrade.unique == null) || __indexOf.call(this.uniques_in_use['Upgrade'], upgrade) < 0) && (!((ship != null) && (upgrade.restriction_func != null)) || upgrade.restriction_func(ship, this_upgrade_obj)) && __indexOf.call(limited_upgrades_in_use, upgrade) < 0) {
            _results.push(upgrade);
          }
        }
        return _results;
      }).call(this);
      if ((ship != null ? (_ref = ship.title) != null ? (_ref1 = _ref.data) != null ? _ref1.special_case : void 0 : void 0 : void 0) === 'A-Wing Test Pilot') {
        _ref2 = (function() {
          var _j, _len, _ref2, _results;
          _ref2 = ship.upgrades;
          _results = [];
          for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
            upgrade = _ref2[_j];
            if ((upgrade != null ? upgrade.data : void 0) != null) {
              _results.push(upgrade.data);
            }
          }
          return _results;
        })();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          equipped_upgrade = _ref2[_i];
          eligible_upgrades.removeItem(equipped_upgrade);
        }
      }
      if ((include_upgrade != null) && (((include_upgrade.unique != null) || (include_upgrade.limited != null)) && this.matcher(include_upgrade.name, term))) {
        eligible_upgrades.push(include_upgrade);
      }
      retval = ((function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = available_upgrades.length; _j < _len1; _j++) {
          upgrade = available_upgrades[_j];
          _results.push({
            id: upgrade.id,
            text: "" + upgrade.name + " (" + upgrade.points + ")",
            points: upgrade.points,
            english_name: upgrade.english_name,
            disabled: __indexOf.call(eligible_upgrades, upgrade) < 0
          });
        }
        return _results;
      })()).sort(exportObj.sortHelper);
      if (this_upgrade_obj.adjustment_func != null) {
        _results = [];
        for (_j = 0, _len1 = retval.length; _j < _len1; _j++) {
          upgrade = retval[_j];
          _results.push(this_upgrade_obj.adjustment_func(upgrade));
        }
        return _results;
      } else {
        return retval;
      }
    };

    SquadBuilder.prototype.getAvailableModificationsIncluding = function(include_modification, ship, term) {
      var available_modifications, eligible_modifications, equipped_modification, modification, modification_name, _i, _len, _ref, _ref1, _ref2;
      if (term == null) {
        term = '';
      }
      available_modifications = (function() {
        var _ref, _results;
        _ref = exportObj.modificationsByLocalizedName;
        _results = [];
        for (modification_name in _ref) {
          modification = _ref[modification_name];
          if (this.matcher(modification_name, term) && ((modification.ship == null) || modification.ship === ship.data.name)) {
            _results.push(modification);
          }
        }
        return _results;
      }).call(this);
      eligible_modifications = (function() {
        var _results;
        _results = [];
        for (modification_name in available_modifications) {
          modification = available_modifications[modification_name];
          if (((modification.unique == null) || __indexOf.call(this.uniques_in_use['Modification'], modification) < 0) && ((modification.faction == null) || modification.faction === this.faction) && (!((ship != null) && (modification.restriction_func != null)) || modification.restriction_func(ship))) {
            _results.push(modification);
          }
        }
        return _results;
      }).call(this);
      if ((ship != null ? (_ref = ship.title) != null ? (_ref1 = _ref.data) != null ? _ref1.special_case : void 0 : void 0 : void 0) === 'Royal Guard TIE') {
        _ref2 = (function() {
          var _j, _len, _ref2, _results;
          _ref2 = ship.modifications;
          _results = [];
          for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
            modification = _ref2[_j];
            if ((modification != null ? modification.data : void 0) != null) {
              _results.push(modification.data);
            }
          }
          return _results;
        })();
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          equipped_modification = _ref2[_i];
          eligible_modifications.removeItem(equipped_modification);
        }
      }
      if ((include_modification != null) && ((include_modification.unique != null) && this.matcher(include_modification.name, term))) {
        eligible_modifications.push(include_modification);
      }
      return ((function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = available_modifications.length; _j < _len1; _j++) {
          modification = available_modifications[_j];
          _results.push({
            id: modification.id,
            text: "" + modification.name + " (" + modification.points + ")",
            points: modification.points,
            english_name: modification.english_name,
            disabled: __indexOf.call(eligible_modifications, modification) < 0
          });
        }
        return _results;
      })()).sort(exportObj.sortHelper);
    };

    SquadBuilder.prototype.getAvailableTitlesIncluding = function(ship, include_title, term) {
      var available_titles, eligible_titles, title, title_name;
      if (term == null) {
        term = '';
      }
      available_titles = (function() {
        var _ref, _results;
        _ref = exportObj.titlesByLocalizedName;
        _results = [];
        for (title_name in _ref) {
          title = _ref[title_name];
          if (title.ship === ship.data.name && this.matcher(title_name, term)) {
            _results.push(title);
          }
        }
        return _results;
      }).call(this);
      eligible_titles = (function() {
        var _results;
        _results = [];
        for (title_name in available_titles) {
          title = available_titles[title_name];
          if (((title.unique == null) || __indexOf.call(this.uniques_in_use['Title'], title) < 0) && ((title.faction == null) || title.faction === this.faction) && (!((ship != null) && (title.restriction_func != null)) || title.restriction_func(ship))) {
            _results.push(title);
          }
        }
        return _results;
      }).call(this);
      if ((include_title != null) && (include_title.unique != null) && this.matcher(include_title.name, term)) {
        eligible_titles.push(include_title);
      }
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = available_titles.length; _i < _len; _i++) {
          title = available_titles[_i];
          _results.push({
            id: title.id,
            text: "" + title.name + " (" + title.points + ")",
            points: title.points,
            english_name: title.english_name,
            disabled: __indexOf.call(eligible_titles, title) < 0
          });
        }
        return _results;
      })()).sort(exportObj.sortHelper);
    };

    SquadBuilder.prototype.getManeuverTableHTML = function(maneuvers, baseManeuvers) {
      var color, haveManeuver, linePath, outTable, outlineColor, speed, transform, trianglePath, turn, v, _i, _j, _k, _len, _ref, _ref1, _ref2;
      if ((maneuvers == null) || maneuvers.length === 0) {
        return "Missing maneuver info.";
      }
      outTable = "<table><tbody>";
      for (speed = _i = _ref = maneuvers.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; speed = _ref <= 0 ? ++_i : --_i) {
        haveManeuver = false;
        _ref1 = maneuvers[speed];
        for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
          v = _ref1[_j];
          if (v > 0) {
            haveManeuver = true;
            break;
          }
        }
        if (!haveManeuver) {
          continue;
        }
        outTable += "<tr><td>" + speed + "</td>";
        for (turn = _k = 0, _ref2 = maneuvers[speed].length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; turn = 0 <= _ref2 ? ++_k : --_k) {
          outTable += "<td>";
          if (maneuvers[speed][turn] > 0) {
            color = (function() {
              switch (maneuvers[speed][turn]) {
                case 1:
                  return "white";
                case 2:
                  return "green";
                case 3:
                  return "red";
              }
            })();
            outTable += "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30px\" height=\"30px\" viewBox=\"0 0 200 200\">";
            if (speed === 0) {
              outTable += "<rect x=\"50\" y=\"50\" width=\"100\" height=\"100\" style=\"fill:" + color + "\" />";
            } else {
              outlineColor = "black";
              if (maneuvers[speed][turn] !== baseManeuvers[speed][turn]) {
                outlineColor = "gold";
              }
              transform = "";
              switch (turn) {
                case 0:
                  linePath = "M160,180 L160,70 80,70";
                  trianglePath = "M80,100 V40 L30,70 Z";
                  break;
                case 1:
                  linePath = "M150,180 S150,120 80,60";
                  trianglePath = "M80,100 V40 L30,70 Z";
                  transform = "transform='translate(-5 -15) rotate(45 70 90)' ";
                  break;
                case 2:
                  linePath = "M100,180 L100,100 100,80";
                  trianglePath = "M70,80 H130 L100,30 Z";
                  break;
                case 3:
                  linePath = "M50,180 S50,120 120,60";
                  trianglePath = "M120,100 V40 L170,70 Z";
                  transform = "transform='translate(5 -15) rotate(-45 130 90)' ";
                  break;
                case 4:
                  linePath = "M40,180 L40,70 120,70";
                  trianglePath = "M120,100 V40 L170,70 Z";
                  break;
                case 5:
                  linePath = "M50,180 L50,100 C50,10 140,10 140,100 L140,120";
                  trianglePath = "M170,120 H110 L140,180 Z";
                  break;
                case 6:
                  linePath = "M150,180 S150,120 80,60";
                  trianglePath = "M80,100 V40 L30,70 Z";
                  transform = "transform='translate(0 50)'";
                  break;
                case 7:
                  linePath = "M50,180 S50,120 120,60";
                  trianglePath = "M120,100 V40 L170,70 Z";
                  transform = "transform='translate(0 50)'";
              }
              outTable += $.trim("<path d='" + trianglePath + "' fill='" + color + "' stroke-width='5' stroke='" + outlineColor + "' " + transform + "/>\n<path stroke-width='25' fill='none' stroke='" + outlineColor + "' d='" + linePath + "' />\n<path stroke-width='15' fill='none' stroke='" + color + "' d='" + linePath + "' />");
            }
            outTable += "</svg>";
          }
          outTable += "</td>";
        }
        outTable += "</tr>";
      }
      outTable += "</tbody></table>";
      return outTable;
    };

    SquadBuilder.prototype.showTooltip = function(type, data) {
      var a, action, effective_stats, extra_actions, ship, slot, source, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      if (data !== this.tooltip_currently_displaying) {
        switch (type) {
          case 'Ship':
            this.info_container.find('.info-sources').text(((function() {
              var _i, _len, _ref, _results;
              _ref = data.pilot.sources;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                source = _ref[_i];
                _results.push(exportObj.translate(this.language, 'sources', source));
              }
              return _results;
            }).call(this)).sort().join(', '));
            effective_stats = data.effectiveStats();
            extra_actions = $.grep(effective_stats.actions, function(el, i) {
              return __indexOf.call(data.data.actions, el) < 0;
            });
            this.info_container.find('.info-name').html("" + (data.pilot.unique ? "&middot;&nbsp;" : "") + data.pilot.name + (data.pilot.epic != null ? " (" + (exportObj.translate(this.language, 'ui', 'epic')) + ")" : "") + (exportObj.isReleased(data.pilot) ? "" : " (" + (exportObj.translate(this.language, 'ui', 'unreleased')) + ")"));
            this.info_container.find('p.info-text').html((_ref = data.pilot.text) != null ? _ref : '');
            this.info_container.find('tr.info-ship td.info-data').text(data.pilot.ship);
            this.info_container.find('tr.info-ship').show();
            this.info_container.find('tr.info-skill td.info-data').text(statAndEffectiveStat(data.pilot.skill, effective_stats, 'skill'));
            this.info_container.find('tr.info-skill').show();
            this.info_container.find('tr.info-attack td.info-data').text(statAndEffectiveStat((_ref1 = (_ref2 = data.pilot.ship_override) != null ? _ref2.attack : void 0) != null ? _ref1 : data.data.attack, effective_stats, 'attack'));
            this.info_container.find('tr.info-attack').toggle((((_ref3 = data.pilot.ship_override) != null ? _ref3.attack : void 0) != null) || (data.data.attack != null));
            this.info_container.find('tr.info-energy td.info-data').text(statAndEffectiveStat((_ref4 = (_ref5 = data.pilot.ship_override) != null ? _ref5.energy : void 0) != null ? _ref4 : data.data.energy, effective_stats, 'energy'));
            this.info_container.find('tr.info-energy').toggle((((_ref6 = data.pilot.ship_override) != null ? _ref6.energy : void 0) != null) || (data.data.energy != null));
            this.info_container.find('tr.info-range').hide();
            this.info_container.find('tr.info-agility td.info-data').text(statAndEffectiveStat((_ref7 = (_ref8 = data.pilot.ship_override) != null ? _ref8.agility : void 0) != null ? _ref7 : data.data.agility, effective_stats, 'agility'));
            this.info_container.find('tr.info-agility').show();
            this.info_container.find('tr.info-hull td.info-data').text(statAndEffectiveStat((_ref9 = (_ref10 = data.pilot.ship_override) != null ? _ref10.hull : void 0) != null ? _ref9 : data.data.hull, effective_stats, 'hull'));
            this.info_container.find('tr.info-hull').show();
            this.info_container.find('tr.info-shields td.info-data').text(statAndEffectiveStat((_ref11 = (_ref12 = data.pilot.ship_override) != null ? _ref12.shields : void 0) != null ? _ref11 : data.data.shields, effective_stats, 'shields'));
            this.info_container.find('tr.info-shields').show();
            this.info_container.find('tr.info-actions td.info-data').html(((function() {
              var _i, _len, _ref13, _results;
              _ref13 = data.data.actions.concat((function() {
                var _j, _len, _results1;
                _results1 = [];
                for (_j = 0, _len = extra_actions.length; _j < _len; _j++) {
                  action = extra_actions[_j];
                  _results1.push("<strong>" + (exportObj.translate(this.language, 'action', action)) + "</strong>");
                }
                return _results1;
              }).call(this));
              _results = [];
              for (_i = 0, _len = _ref13.length; _i < _len; _i++) {
                a = _ref13[_i];
                _results.push(exportObj.translate(this.language, 'action', a));
              }
              return _results;
            }).call(this)).join(', '));
            this.info_container.find('tr.info-actions').show();
            this.info_container.find('tr.info-upgrades').show();
            this.info_container.find('tr.info-upgrades td.info-data').text(((function() {
              var _i, _len, _ref13, _results;
              _ref13 = data.pilot.slots;
              _results = [];
              for (_i = 0, _len = _ref13.length; _i < _len; _i++) {
                slot = _ref13[_i];
                _results.push(exportObj.translate(this.language, 'slot', slot));
              }
              return _results;
            }).call(this)).join(', ') || 'None');
            this.info_container.find('p.info-maneuvers').show();
            this.info_container.find('p.info-maneuvers').html(this.getManeuverTableHTML(effective_stats.maneuvers, data.data.maneuvers));
            break;
          case 'Pilot':
            this.info_container.find('.info-sources').text(((function() {
              var _i, _len, _ref13, _results;
              _ref13 = data.sources;
              _results = [];
              for (_i = 0, _len = _ref13.length; _i < _len; _i++) {
                source = _ref13[_i];
                _results.push(exportObj.translate(this.language, 'sources', source));
              }
              return _results;
            }).call(this)).sort().join(', '));
            this.info_container.find('.info-name').html("" + (data.unique ? "&middot;&nbsp;" : "") + data.name + (data.epic != null ? " (" + (exportObj.translate(this.language, 'ui', 'epic')) + ")" : "") + (exportObj.isReleased(data) ? "" : " (" + (exportObj.translate(this.language, 'ui', 'unreleased')) + ")"));
            this.info_container.find('p.info-text').html((_ref13 = data.text) != null ? _ref13 : '');
            ship = exportObj.ships[data.ship];
            this.info_container.find('tr.info-ship td.info-data').text(data.ship);
            this.info_container.find('tr.info-ship').show();
            this.info_container.find('tr.info-skill td.info-data').text(data.skill);
            this.info_container.find('tr.info-skill').show();
            this.info_container.find('tr.info-attack td.info-data').text((_ref14 = (_ref15 = data.ship_override) != null ? _ref15.attack : void 0) != null ? _ref14 : ship.attack);
            this.info_container.find('tr.info-attack').toggle((((_ref16 = data.ship_override) != null ? _ref16.attack : void 0) != null) || (ship.attack != null));
            this.info_container.find('tr.info-energy td.info-data').text((_ref17 = (_ref18 = data.ship_override) != null ? _ref18.energy : void 0) != null ? _ref17 : ship.energy);
            this.info_container.find('tr.info-energy').toggle((((_ref19 = data.ship_override) != null ? _ref19.energy : void 0) != null) || (ship.energy != null));
            this.info_container.find('tr.info-range').hide();
            this.info_container.find('tr.info-agility td.info-data').text((_ref20 = (_ref21 = data.ship_override) != null ? _ref21.agility : void 0) != null ? _ref20 : ship.agility);
            this.info_container.find('tr.info-agility').show();
            this.info_container.find('tr.info-hull td.info-data').text((_ref22 = (_ref23 = data.ship_override) != null ? _ref23.hull : void 0) != null ? _ref22 : ship.hull);
            this.info_container.find('tr.info-hull').show();
            this.info_container.find('tr.info-shields td.info-data').text((_ref24 = (_ref25 = data.ship_override) != null ? _ref25.shields : void 0) != null ? _ref24 : ship.shields);
            this.info_container.find('tr.info-shields').show();
            this.info_container.find('tr.info-actions td.info-data').text(((function() {
              var _i, _len, _ref26, _ref27, _ref28, _results;
              _ref28 = (_ref26 = (_ref27 = data.ship_override) != null ? _ref27.actions : void 0) != null ? _ref26 : exportObj.ships[data.ship].actions;
              _results = [];
              for (_i = 0, _len = _ref28.length; _i < _len; _i++) {
                action = _ref28[_i];
                _results.push(exportObj.translate(this.language, 'action', action));
              }
              return _results;
            }).call(this)).join(', '));
            this.info_container.find('tr.info-actions').show();
            this.info_container.find('tr.info-upgrades').show();
            this.info_container.find('tr.info-upgrades td.info-data').text(((function() {
              var _i, _len, _ref26, _results;
              _ref26 = data.slots;
              _results = [];
              for (_i = 0, _len = _ref26.length; _i < _len; _i++) {
                slot = _ref26[_i];
                _results.push(exportObj.translate(this.language, 'slot', slot));
              }
              return _results;
            }).call(this)).join(', ') || 'None');
            this.info_container.find('p.info-maneuvers').show();
            this.info_container.find('p.info-maneuvers').html(this.getManeuverTableHTML(ship.maneuvers, ship.maneuvers));
            break;
          case 'Addon':
            this.info_container.find('.info-sources').text(((function() {
              var _i, _len, _ref26, _results;
              _ref26 = data.sources;
              _results = [];
              for (_i = 0, _len = _ref26.length; _i < _len; _i++) {
                source = _ref26[_i];
                _results.push(exportObj.translate(this.language, 'sources', source));
              }
              return _results;
            }).call(this)).sort().join(', '));
            this.info_container.find('.info-name').html("" + (data.unique ? "&middot;&nbsp;" : "") + data.name + (data.limited != null ? " (" + (exportObj.translate(this.language, 'ui', 'limited')) + ")" : "") + (data.epic != null ? " (" + (exportObj.translate(this.language, 'ui', 'epic')) + ")" : "") + (exportObj.isReleased(data) ? "" : " (" + (exportObj.translate(this.language, 'ui', 'unreleased')) + ")"));
            this.info_container.find('p.info-text').html((_ref26 = data.text) != null ? _ref26 : '');
            this.info_container.find('tr.info-ship').hide();
            this.info_container.find('tr.info-skill').hide();
            if (data.energy != null) {
              this.info_container.find('tr.info-energy td.info-data').text(data.energy);
              this.info_container.find('tr.info-energy').show();
            } else {
              this.info_container.find('tr.info-energy').hide();
            }
            if (data.attack != null) {
              this.info_container.find('tr.info-attack td.info-data').text(data.attack);
              this.info_container.find('tr.info-attack').show();
            } else {
              this.info_container.find('tr.info-attack').hide();
            }
            if (data.range != null) {
              this.info_container.find('tr.info-range td.info-data').text(data.range);
              this.info_container.find('tr.info-range').show();
            } else {
              this.info_container.find('tr.info-range').hide();
            }
            this.info_container.find('tr.info-agility').hide();
            this.info_container.find('tr.info-hull').hide();
            this.info_container.find('tr.info-shields').hide();
            this.info_container.find('tr.info-actions').hide();
            this.info_container.find('tr.info-upgrades').hide();
            this.info_container.find('p.info-maneuvers').hide();
        }
        this.info_container.show();
        return this.tooltip_currently_displaying = data;
      }
    };

    SquadBuilder.prototype._randomizerLoopBody = function(data) {
      var addon, available_modifications, available_pilots, available_ships, available_titles, available_upgrades, idx, modification, new_ship, pilot, removable_things, ship, ship_type, thing_to_remove, title, unused_addons, upgrade, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      if (data.keep_running && data.iterations < data.max_iterations) {
        data.iterations++;
        if (this.total_points === data.max_points) {
          data.keep_running = false;
        } else if (this.total_points < data.max_points) {
          unused_addons = [];
          _ref = this.ships;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            ship = _ref[_i];
            _ref1 = ship.upgrades;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              upgrade = _ref1[_j];
              if (upgrade.data == null) {
                unused_addons.push(upgrade);
              }
            }
            if ((ship.title != null) && (ship.title.data == null)) {
              unused_addons.push(ship.title);
            }
            _ref2 = ship.modifications;
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              modification = _ref2[_k];
              if (modification.data == null) {
                unused_addons.push(modification);
              }
            }
          }
          idx = $.randomInt(1 + unused_addons.length);
          if (idx === 0) {
            available_ships = this.getAvailableShipsMatching();
            ship_type = available_ships[$.randomInt(available_ships.length)].text;
            available_pilots = this.getAvailablePilotsForShipIncluding(ship_type);
            pilot = available_pilots[$.randomInt(available_pilots.length)];
            if (exportObj.pilotsById[pilot.id].sources.intersects(data.allowed_sources)) {
              new_ship = this.addShip();
              new_ship.setPilotById(pilot.id);
            }
          } else {
            addon = unused_addons[idx - 1];
            switch (addon.type) {
              case 'Upgrade':
                available_upgrades = (function() {
                  var _l, _len3, _ref3, _results;
                  _ref3 = this.getAvailableUpgradesIncluding(addon.slot, null, addon.ship);
                  _results = [];
                  for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
                    upgrade = _ref3[_l];
                    if (exportObj.upgradesById[upgrade.id].sources.intersects(data.allowed_sources)) {
                      _results.push(upgrade);
                    }
                  }
                  return _results;
                }).call(this);
                if (available_upgrades.length > 0) {
                  addon.setById(available_upgrades[$.randomInt(available_upgrades.length)].id);
                }
                break;
              case 'Title':
                available_titles = (function() {
                  var _l, _len3, _ref3, _results;
                  _ref3 = this.getAvailableTitlesIncluding(addon.ship);
                  _results = [];
                  for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
                    title = _ref3[_l];
                    if (exportObj.titlesById[title.id].sources.intersects(data.allowed_sources)) {
                      _results.push(title);
                    }
                  }
                  return _results;
                }).call(this);
                if (available_titles.length > 0) {
                  addon.setById(available_titles[$.randomInt(available_titles.length)].id);
                }
                break;
              case 'Modification':
                available_modifications = (function() {
                  var _l, _len3, _ref3, _results;
                  _ref3 = this.getAvailableModificationsIncluding(null, addon.ship);
                  _results = [];
                  for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
                    modification = _ref3[_l];
                    if (exportObj.modificationsById[modification.id].sources.intersects(data.allowed_sources)) {
                      _results.push(modification);
                    }
                  }
                  return _results;
                }).call(this);
                if (available_modifications.length > 0) {
                  addon.setById(available_modifications[$.randomInt(available_modifications.length)].id);
                }
                break;
              default:
                throw new Error("Invalid addon type " + addon.type);
            }
          }
        } else {
          removable_things = [];
          _ref3 = this.ships;
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            ship = _ref3[_l];
            removable_things.push(ship);
            _ref4 = ship.upgrades;
            for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
              upgrade = _ref4[_m];
              if (upgrade.data != null) {
                removable_things.push(upgrade);
              }
            }
            if (((_ref5 = ship.title) != null ? _ref5.data : void 0) != null) {
              removable_things.push(ship.title);
            }
            if (((_ref6 = ship.modification) != null ? _ref6.data : void 0) != null) {
              removable_things.push(ship.modification);
            }
          }
          if (removable_things.length > 0) {
            thing_to_remove = removable_things[$.randomInt(removable_things.length)];
            if (thing_to_remove instanceof Ship) {
              this.removeShip(thing_to_remove);
            } else if (thing_to_remove instanceof GenericAddon) {
              thing_to_remove.setData(null);
            } else {
              throw new Error("Unknown thing to remove " + thing_to_remove);
            }
          }
        }
        return window.setTimeout(this._makeRandomizerLoopFunc(data), 0);
      } else {
        window.clearTimeout(data.timer);
        _ref7 = this.ships;
        for (_n = 0, _len5 = _ref7.length; _n < _len5; _n++) {
          ship = _ref7[_n];
          ship.updateSelections();
        }
        this.suppress_automatic_new_ship = false;
        return this.addShip();
      }
    };

    SquadBuilder.prototype._makeRandomizerLoopFunc = function(data) {
      return (function(_this) {
        return function() {
          return _this._randomizerLoopBody(data);
        };
      })(this);
    };

    SquadBuilder.prototype.randomSquad = function(max_points, allowed_sources, timeout_ms, max_iterations) {
      var data, stopHandler;
      if (max_points == null) {
        max_points = 100;
      }
      if (allowed_sources == null) {
        allowed_sources = null;
      }
      if (timeout_ms == null) {
        timeout_ms = 1000;
      }
      if (max_iterations == null) {
        max_iterations = 1000;
      }
      this.backend_status.fadeOut('slow');
      this.suppress_automatic_new_ship = true;
      while (this.ships.length > 0) {
        this.removeShip(this.ships[0]);
      }
      if (this.ships.length > 0) {
        throw new Error("Ships not emptied");
      }
      data = {
        iterations: 0,
        max_points: max_points,
        max_iterations: max_iterations,
        keep_running: true,
        allowed_sources: allowed_sources != null ? allowed_sources : exportObj.expansions
      };
      stopHandler = (function(_this) {
        return function() {
          return data.keep_running = false;
        };
      })(this);
      data.timer = window.setTimeout(stopHandler, timeout_ms);
      window.setTimeout(this._makeRandomizerLoopFunc(data), 0);
      this.resetCurrentSquad();
      this.current_squad.name = 'Random Squad';
      return this.container.trigger('xwing-backend:squadNameChanged');
    };

    SquadBuilder.prototype.setBackend = function(backend) {
      return this.backend = backend;
    };

    SquadBuilder.prototype.describeSquad = function() {
      var ship;
      return ((function() {
        var _i, _len, _ref, _results;
        _ref = this.ships;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ship = _ref[_i];
          if (ship.pilot != null) {
            _results.push(ship.pilot.name);
          }
        }
        return _results;
      }).call(this)).join(', ');
    };

    SquadBuilder.prototype.listCards = function() {
      var card_obj, ship, upgrade, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
      card_obj = {};
      _ref = this.ships;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ship = _ref[_i];
        if (ship.pilot != null) {
          card_obj[ship.pilot.name] = null;
          _ref1 = ship.upgrades;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            upgrade = _ref1[_j];
            if (upgrade.data != null) {
              card_obj[upgrade.data.name] = null;
            }
          }
          if (((_ref2 = ship.title) != null ? _ref2.data : void 0) != null) {
            card_obj[ship.title.data.name] = null;
          }
          if (((_ref3 = ship.modification) != null ? _ref3.data : void 0) != null) {
            card_obj[ship.modification.data.name] = null;
          }
        }
      }
      return Object.keys(card_obj).sort();
    };

    SquadBuilder.prototype.getNotes = function() {
      return this.notes.val();
    };

    SquadBuilder.prototype.isSquadPossibleWithCollection = function() {
      var modification, modification_is_available, pilot_is_available, ship, ship_is_available, title_is_available, upgrade, upgrade_is_available, validity, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      if (Object.keys((_ref = (_ref1 = this.collection) != null ? _ref1.expansions : void 0) != null ? _ref : {}).length === 0) {
        return true;
      }
      this.collection.reset();
      validity = true;
      _ref2 = this.ships;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        ship = _ref2[_i];
        if (ship.pilot != null) {
          ship_is_available = this.collection.use('ship', ship.pilot.english_ship);
          pilot_is_available = this.collection.use('pilot', ship.pilot.english_name);
          if (!(ship_is_available && pilot_is_available)) {
            validity = false;
          }
          _ref3 = ship.upgrades;
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            upgrade = _ref3[_j];
            if (upgrade.data != null) {
              upgrade_is_available = this.collection.use('upgrade', upgrade.data.english_name);
              if (!upgrade_is_available) {
                validity = false;
              }
            }
          }
          _ref4 = ship.modifications;
          for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
            modification = _ref4[_k];
            if (modification.data != null) {
              modification_is_available = this.collection.use('modification', modification.data.english_name);
              if (!modification_is_available) {
                validity = false;
              }
            }
          }
          if (((_ref5 = ship.title) != null ? _ref5.data : void 0) != null) {
            title_is_available = this.collection.use('title', ship.title.data.english_name);
            if (!title_is_available) {
              validity = false;
            }
          }
        }
      }
      return validity;
    };

    SquadBuilder.prototype.checkCollection = function() {
      if (this.collection != null) {
        return this.collection_invalid_container.toggleClass('hidden', this.isSquadPossibleWithCollection());
      }
    };

    SquadBuilder.prototype.toXWS = function() {
      var candidate, last_id, match, matches, multisection_id_to_pilots, pilot, ship, unmatched, unmatched_pilot, xws, _, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _name, _ref, _ref1, _ref2, _ref3;
      xws = {
        description: this.getNotes(),
        faction: exportObj.toXWSFaction[this.faction],
        name: this.current_squad.name,
        pilots: [],
        points: this.total_points,
        vendor: {
          yasb: {
            builder: '(Yet Another) X-Wing Miniatures Squad Builder',
            builder_url: window.location.href.split('?')[0],
            link: this.permalink.attr('href')
          }
        },
        version: '0.2.0'
      };
      _ref = this.ships;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ship = _ref[_i];
        if (ship.pilot != null) {
          xws.pilots.push(ship.toXWS());
        }
      }
      multisection_id_to_pilots = {};
      last_id = 0;
      unmatched = (function() {
        var _j, _len1, _ref1, _results;
        _ref1 = xws.pilots;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          pilot = _ref1[_j];
          if (pilot.multisection != null) {
            _results.push(pilot);
          }
        }
        return _results;
      })();
      for (_ = _j = 0, _ref1 = Math.pow(unmatched.length, 2); 0 <= _ref1 ? _j < _ref1 : _j > _ref1; _ = 0 <= _ref1 ? ++_j : --_j) {
        if (unmatched.length === 0) {
          break;
        }
        unmatched_pilot = unmatched.shift();
        if (unmatched_pilot.multisection_id == null) {
          unmatched_pilot.multisection_id = last_id++;
        }
        if (multisection_id_to_pilots[_name = unmatched_pilot.multisection_id] == null) {
          multisection_id_to_pilots[_name] = [unmatched_pilot];
        }
        if (unmatched.length === 0) {
          break;
        }
        matches = [];
        for (_k = 0, _len1 = unmatched.length; _k < _len1; _k++) {
          candidate = unmatched[_k];
          if (_ref2 = unmatched_pilot.name, __indexOf.call(candidate.multisection, _ref2) >= 0) {
            matches.push(candidate);
            unmatched_pilot.multisection.removeItem(candidate.name);
            candidate.multisection.removeItem(unmatched_pilot.name);
            candidate.multisection_id = unmatched_pilot.multisection_id;
            multisection_id_to_pilots[candidate.multisection_id].push(candidate);
            if (unmatched_pilot.multisection.length === 0) {
              break;
            }
          }
        }
        for (_l = 0, _len2 = matches.length; _l < _len2; _l++) {
          match = matches[_l];
          if (match.multisection.length === 0) {
            unmatched.removeItem(match);
          }
        }
      }
      _ref3 = xws.pilots;
      for (_m = 0, _len3 = _ref3.length; _m < _len3; _m++) {
        pilot = _ref3[_m];
        if (pilot.multisection != null) {
          delete pilot.multisection;
        }
      }
      return xws;
    };

    SquadBuilder.prototype.toMinimalXWS = function() {
      var k, v, xws, _ref;
      xws = this.toXWS();
      for (k in xws) {
        if (!__hasProp.call(xws, k)) continue;
        v = xws[k];
        if (k !== 'faction' && k !== 'pilots' && k !== 'version') {
          delete xws[k];
        }
      }
      _ref = xws.pilots;
      for (k in _ref) {
        if (!__hasProp.call(_ref, k)) continue;
        v = _ref[k];
        if (k !== 'name' && k !== 'ship' && k !== 'upgrades' && k !== 'multisection_id') {
          delete xws[k];
        }
      }
      return xws;
    };

    SquadBuilder.prototype.loadFromXWS = function(xws, cb) {
      var a, addon, addon_added, addons, err, error, i, modification, new_ship, pilot, slot, slot_guesses, success, upgrade, upgrade_canonical, upgrade_canonicals, upgrade_type, xws_faction, yasb_upgrade_type, _, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      success = null;
      error = null;
      switch (xws.version) {
        case '0.2.0':
        case '0.1.1':
          xws_faction = exportObj.fromXWSFaction[xws.faction];
          if (this.faction !== xws_faction) {
            throw new Error("Attempted to load XWS for " + xws.faction + " but builder is " + this.faction);
          }
          if (xws.name != null) {
            this.current_squad.name = xws.name;
          }
          if (xws.description != null) {
            this.notes.val(xws.description);
          }
          this.suppress_automatic_new_ship = true;
          this.removeAllShips();
          _ref = xws.pilots;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            pilot = _ref[_i];
            new_ship = this.addShip();
            try {
              new_ship.setPilot(exportObj.pilotsByFactionCanonicalName[this.faction][pilot.name]);
            } catch (_error) {
              err = _error;
              console.error(err.message);
              continue;
            }
            addons = [];
            _ref2 = (_ref1 = pilot.upgrades) != null ? _ref1 : {};
            for (upgrade_type in _ref2) {
              upgrade_canonicals = _ref2[upgrade_type];
              for (_j = 0, _len1 = upgrade_canonicals.length; _j < _len1; _j++) {
                upgrade_canonical = upgrade_canonicals[_j];
                slot = null;
                yasb_upgrade_type = (_ref3 = exportObj.fromXWSUpgrade[upgrade_type]) != null ? _ref3 : upgrade_type.capitalize();
                addon = (function() {
                  switch (yasb_upgrade_type) {
                    case 'Modification':
                      return exportObj.modificationsByCanonicalName[upgrade_canonical];
                    case 'Title':
                      return exportObj.titlesByCanonicalName[upgrade_canonical];
                    default:
                      slot = yasb_upgrade_type;
                      return exportObj.upgradesBySlotCanonicalName[slot][upgrade_canonical];
                  }
                })();
                if (addon != null) {
                  addons.push({
                    type: yasb_upgrade_type,
                    data: addon,
                    slot: slot
                  });
                }
              }
            }
            if (addons.length > 0) {
              for (_ = _k = 0; _k < 1000; _ = ++_k) {
                addon = addons.shift();
                addon_added = false;
                switch (addon.type) {
                  case 'Modification':
                    _ref4 = new_ship.modifications;
                    for (_l = 0, _len2 = _ref4.length; _l < _len2; _l++) {
                      modification = _ref4[_l];
                      if (modification.data != null) {
                        continue;
                      }
                      modification.setData(addon.data);
                      addon_added = true;
                      break;
                    }
                    break;
                  case 'Title':
                    if (new_ship.title.data == null) {
                      if (addon.data instanceof Array) {
                        slot_guesses = (function() {
                          var _len3, _m, _ref5, _results;
                          _results = [];
                          for (_m = 0, _len3 = addons.length; _m < _len3; _m++) {
                            a = addons[_m];
                            if ((_ref5 = a.data.slot) === 'Cannon' || _ref5 === 'Missile' || _ref5 === 'Torpedo') {
                              _results.push(a.data.slot);
                            }
                          }
                          return _results;
                        })();
                        if (slot_guesses.length > 0) {
                          new_ship.title.setData(exportObj.titlesByLocalizedName["\"Heavy Scyk\" Interceptor (" + slot_guesses[0] + ")"]);
                        } else {
                          new_ship.title.setData(addon.data[0]);
                        }
                      } else {
                        new_ship.title.setData(addon.data);
                      }
                      addon_added = true;
                    }
                    break;
                  default:
                    _ref5 = new_ship.upgrades;
                    for (i = _m = 0, _len3 = _ref5.length; _m < _len3; i = ++_m) {
                      upgrade = _ref5[i];
                      if (upgrade.slot !== addon.slot || (upgrade.data != null)) {
                        continue;
                      }
                      upgrade.setData(addon.data);
                      addon_added = true;
                      break;
                    }
                }
                if (addon_added) {
                  if (addons.length === 0) {
                    break;
                  }
                } else {
                  if (addons.length === 0) {
                    success = false;
                    error = "Could not add " + addon.data.name + " to " + new_ship;
                    break;
                  } else {
                    addons.push(addon);
                  }
                }
              }
              if (addons.length > 0) {
                success = false;
                error = "Could not add all upgrades";
                break;
              }
            }
          }
          this.suppress_automatic_new_ship = false;
          this.addShip();
          success = true;
          break;
        default:
          success = false;
          error = "Invalid or unsupported XWS version";
      }
      if (success) {
        this.current_squad.dirty = true;
        this.container.trigger('xwing-backend:squadNameChanged');
        this.container.trigger('xwing-backend:squadDirtinessChanged');
      }
      return cb({
        success: success,
        error: error
      });
    };

    return SquadBuilder;

  })();

  Ship = (function() {
    function Ship(args) {
      this.builder = args.builder;
      this.container = args.container;
      this.pilot = null;
      this.data = null;
      this.upgrades = [];
      this.modifications = [];
      this.title = null;
      this.setupUI();
    }

    Ship.prototype.destroy = function(cb) {
      var idx;
      this.resetPilot();
      this.resetAddons();
      this.teardownUI();
      idx = this.builder.ships.indexOf(this);
      if (idx < 0) {
        throw new Error("Ship not registered with builder");
      }
      this.builder.ships.splice(idx, 1);
      return cb();
    };

    Ship.prototype.copyFrom = function(other) {
      var i, other_conferred_addon, other_conferred_addons, other_upgrade, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      if (other === this) {
        throw new Error("Cannot copy from self");
      }
      if (!((other.pilot != null) && (other.data != null) && !other.pilot.unique)) {
        return;
      }
      this.setPilotById(other.pilot.id);
      other_conferred_addons = [];
      if ((other.title != null) && other.title.conferredAddons.length > 0) {
        other_conferred_addons = other_conferred_addons.concat(other.title.conferredAddons);
      }
      if (((_ref = other.modifications[0]) != null ? _ref.data : void 0) != null) {
        other_conferred_addons = other_conferred_addons.concat(other.modifications[0].conferredAddons);
      }
      _ref1 = other.upgrades;
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        other_upgrade = _ref1[i];
        if ((other_upgrade.data != null) && __indexOf.call(other_conferred_addons, other_upgrade) < 0 && !other_upgrade.data.unique) {
          this.upgrades[i].setById(other_upgrade.data.id);
        }
      }
      if ((((_ref2 = other.title) != null ? _ref2.data : void 0) != null) && !other.title.data.unique) {
        this.title.setById(other.title.data.id);
      }
      if (((_ref3 = other.modifications[0]) != null ? _ref3.data : void 0) && !other.modifications[0].data.unique) {
        this.modifications[0].setById(other.modifications[0].data.id);
      }
      if ((other.title != null) && other.title.conferredAddons.length > 0) {
        _ref4 = other.title.conferredAddons;
        for (i = _j = 0, _len1 = _ref4.length; _j < _len1; i = ++_j) {
          other_conferred_addon = _ref4[i];
          if ((other_conferred_addon.data != null) && !((_ref5 = other_conferred_addon.data) != null ? _ref5.unique : void 0)) {
            this.title.conferredAddons[i].setById(other_conferred_addon.data.id);
          }
        }
      }
      if ((other.modifications[0] != null) && other.modifications[0].conferredAddons.length > 0) {
        _ref6 = other.modifications[0].conferredAddons;
        for (i = _k = 0, _len2 = _ref6.length; _k < _len2; i = ++_k) {
          other_conferred_addon = _ref6[i];
          if ((other_conferred_addon.data != null) && !((_ref7 = other_conferred_addon.data) != null ? _ref7.unique : void 0)) {
            this.modifications[0].conferredAddons[i].setById(other_conferred_addon.data.id);
          }
        }
      }
      this.updateSelections();
      this.builder.container.trigger('xwing:pointsUpdated');
      this.builder.current_squad.dirty = true;
      return this.builder.container.trigger('xwing-backend:squadDirtinessChanged');
    };

    Ship.prototype.setShipType = function(ship_type) {
      var cls, result, _i, _len, _ref, _ref1;
      this.pilot_selector.data('select2').container.show();
      if (ship_type !== ((_ref = this.pilot) != null ? _ref.ship : void 0)) {
        this.setPilot(((function() {
          var _i, _len, _ref1, _results;
          _ref1 = this.builder.getAvailablePilotsForShipIncluding(ship_type);
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            result = _ref1[_i];
            if (!exportObj.pilotsById[result.id].unique) {
              _results.push(exportObj.pilotsById[result.id]);
            }
          }
          return _results;
        }).call(this))[0]);
      }
      _ref1 = this.row.attr('class').split(/\s+/);
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        cls = _ref1[_i];
        if (cls.indexOf('ship-') === 0) {
          this.row.removeClass(cls);
        }
      }
      this.remove_button.fadeIn('fast');
      this.row.addClass("ship-" + (ship_type.toLowerCase().replace(/[^a-z0-9]/gi, '')) + "0");
      return this.builder.container.trigger('xwing:shipUpdated');
    };

    Ship.prototype.setPilotById = function(id) {
      return this.setPilot(exportObj.pilotsById[parseInt(id)]);
    };

    Ship.prototype.setPilotByName = function(name) {
      return this.setPilot(exportObj.pilotsByLocalizedName[$.trim(name)]);
    };

    Ship.prototype.setPilot = function(new_pilot) {
      var modification, old_modification, old_modifications, old_title, old_upgrade, old_upgrades, ship_changed, upgrade, ___iced_passed_deferral, __iced_deferrals, __iced_k, _i, _j, _len, _len1, _name, _ref, _ref1;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      if (new_pilot !== this.pilot) {
        ship_changed = (this.pilot != null) && (new_pilot != null ? new_pilot.ship : void 0) === this.pilot.ship;
        old_upgrades = {};
        old_title = null;
        old_modifications = [];
        if (ship_changed) {
          _ref = this.upgrades;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            upgrade = _ref[_i];
            if ((upgrade != null ? upgrade.data : void 0) != null) {
              if (old_upgrades[_name = upgrade.slot] == null) {
                old_upgrades[_name] = [];
              }
              old_upgrades[upgrade.slot].push(upgrade);
            }
          }
          if (this.title != null) {
            old_title = this.title;
          }
          _ref1 = this.modifications;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            modification = _ref1[_j];
            if ((modification != null ? modification.data : void 0) != null) {
              old_modifications.push(modification);
            }
          }
        }
        this.resetPilot();
        this.resetAddons();
        (function(_this) {
          return (function(__iced_k) {
            if (new_pilot != null) {
              _this.data = exportObj.ships[new_pilot != null ? new_pilot.ship : void 0];
              (function(__iced_k) {
                if ((new_pilot != null ? new_pilot.unique : void 0) != null) {
                  (function(__iced_k) {
                    __iced_deferrals = new iced.Deferrals(__iced_k, {
                      parent: ___iced_passed_deferral,
                      filename: "coffeescripts/xwing.coffee",
                      funcname: "Ship.setPilot"
                    });
                    _this.builder.container.trigger('xwing:claimUnique', [
                      new_pilot, 'Pilot', __iced_deferrals.defer({
                        lineno: 1711
                      })
                    ]);
                    __iced_deferrals._fulfill();
                  })(__iced_k);
                } else {
                  return __iced_k();
                }
              })(function() {
                var _k, _l, _len2, _len3, _ref2, _ref3, _ref4, _ref5;
                _this.pilot = new_pilot;
                if (_this.pilot != null) {
                  _this.setupAddons();
                }
                _this.copy_button.toggle(!((_ref2 = _this.pilot) != null ? _ref2.unique : void 0));
                _this.setShipType(_this.pilot.ship);
                if (ship_changed) {
                  if ((old_title != null ? old_title.data : void 0) != null) {
                    _this.title.setById(old_title.data.id);
                  }
                  _ref3 = _this.modifications;
                  for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
                    modification = _ref3[_k];
                    old_modification = old_modifications.shift();
                    if (old_modification != null) {
                      modification.setById(old_modification.data.id);
                    }
                  }
                  _ref4 = _this.upgrades;
                  for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
                    upgrade = _ref4[_l];
                    old_upgrade = ((_ref5 = old_upgrades[upgrade.slot]) != null ? _ref5 : []).shift();
                    if (old_upgrade != null) {
                      upgrade.setById(old_upgrade.data.id);
                    }
                  }
                }
                return __iced_k();
              });
            } else {
              return __iced_k(_this.copy_button.hide());
            }
          });
        })(this)((function(_this) {
          return function() {
            _this.builder.container.trigger('xwing:pointsUpdated');
            return __iced_k(_this.builder.container.trigger('xwing-backend:squadDirtinessChanged'));
          };
        })(this));
      } else {
        return __iced_k();
      }
    };

    Ship.prototype.resetPilot = function() {
      var ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(_this) {
        return (function(__iced_k) {
          var _ref;
          if (((_ref = _this.pilot) != null ? _ref.unique : void 0) != null) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "coffeescripts/xwing.coffee",
                funcname: "Ship.resetPilot"
              });
              _this.builder.container.trigger('xwing:releaseUnique', [
                _this.pilot, 'Pilot', __iced_deferrals.defer({
                  lineno: 1735
                })
              ]);
              __iced_deferrals._fulfill();
            })(__iced_k);
          } else {
            return __iced_k();
          }
        });
      })(this)((function(_this) {
        return function() {
          return _this.pilot = null;
        };
      })(this));
    };

    Ship.prototype.setupAddons = function() {
      var slot, _i, _len, _ref, _ref1;
      _ref1 = (_ref = this.pilot.slots) != null ? _ref : [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        slot = _ref1[_i];
        this.upgrades.push(new exportObj.Upgrade({
          ship: this,
          container: this.addon_container,
          slot: slot
        }));
      }
      if (this.pilot.ship in exportObj.titlesByShip) {
        this.title = new exportObj.Title({
          ship: this,
          container: this.addon_container
        });
      }
      return this.modifications.push(new exportObj.Modification({
        ship: this,
        container: this.addon_container
      }));
    };

    Ship.prototype.resetAddons = function() {
      var modification, upgrade, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(_this) {
        return (function(__iced_k) {
          var _i, _j, _len, _len1, _ref, _ref1;
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "coffeescripts/xwing.coffee",
            funcname: "Ship.resetAddons"
          });
          if (_this.title != null) {
            _this.title.destroy(__iced_deferrals.defer({
              lineno: 1757
            }));
          }
          _ref = _this.upgrades;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            upgrade = _ref[_i];
            upgrade.destroy(__iced_deferrals.defer({
              lineno: 1759
            }));
          }
          _ref1 = _this.modifications;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            modification = _ref1[_j];
            if (modification != null) {
              modification.destroy(__iced_deferrals.defer({
                lineno: 1761
              }));
            }
          }
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          _this.upgrades = [];
          _this.modifications = [];
          return _this.title = null;
        };
      })(this));
    };

    Ship.prototype.getPoints = function() {
      var modification, points, upgrade, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
      points = ((_ref = (_ref1 = this.pilot) != null ? _ref1.points : void 0) != null ? _ref : 0) + ((_ref2 = (_ref3 = this.title) != null ? _ref3.getPoints() : void 0) != null ? _ref2 : 0);
      _ref4 = this.upgrades;
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        upgrade = _ref4[_i];
        points += upgrade.getPoints();
      }
      _ref5 = this.modifications;
      for (_j = 0, _len1 = _ref5.length; _j < _len1; _j++) {
        modification = _ref5[_j];
        points += (_ref6 = modification != null ? modification.getPoints() : void 0) != null ? _ref6 : 0;
      }
      this.points_container.find('span').text(points);
      if (points > 0) {
        this.points_container.fadeTo('fast', 1);
      } else {
        this.points_container.fadeTo(0, 0);
      }
      return points;
    };

    Ship.prototype.getEpicPoints = function() {
      var _ref, _ref1;
      return (_ref = (_ref1 = this.data) != null ? _ref1.epic_points : void 0) != null ? _ref : 0;
    };

    Ship.prototype.updateSelections = function() {
      var modification, upgrade, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (this.pilot != null) {
        this.ship_selector.select2('data', {
          id: this.pilot.ship,
          text: this.pilot.ship
        });
        this.pilot_selector.select2('data', {
          id: this.pilot.id,
          text: "" + this.pilot.name + " (" + this.pilot.points + ")"
        });
        this.pilot_selector.data('select2').container.show();
        _ref = this.upgrades;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          upgrade = _ref[_i];
          upgrade.updateSelection();
        }
        if (this.title != null) {
          this.title.updateSelection();
        }
        _ref1 = this.modifications;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          modification = _ref1[_j];
          if (modification != null) {
            _results.push(modification.updateSelection());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      } else {
        this.pilot_selector.select2('data', null);
        return this.pilot_selector.data('select2').container.toggle(this.ship_selector.val() !== '');
      }
    };

    Ship.prototype.setupUI = function() {
      this.row = $(document.createElement('DIV'));
      this.row.addClass('row-fluid ship');
      this.row.insertBefore(this.builder.notes_container);
      this.row.append($.trim('<div class="span3">\n    <input class="ship-selector-container" type="hidden" />\n    <br />\n    <input type="hidden" class="pilot-selector-container" />\n</div>\n<div class="span1 points-display-container">\n    <span></span>\n</div>\n<div class="span6 addon-container" />\n<div class="span2 button-container">\n    <button class="btn btn-danger remove-pilot"><span class="visible-desktop visible-tablet hidden-phone" data-toggle="tooltip" title="Remove Pilot"><i class="icon-remove"></i></span><span class="hidden-desktop hidden-tablet visible-phone">Remove Pilot</span></button>\n    <button class="btn copy-pilot"><span class="visible-desktop visible-tablet hidden-phone" data-toggle="tooltip" title="Clone Pilot"><i class="icon-copy"></i></span><span class="hidden-desktop hidden-tablet visible-phone">Clone Pilot</span></button>\n</div>'));
      this.row.find('.button-container span').tooltip();
      this.ship_selector = $(this.row.find('input.ship-selector-container'));
      this.pilot_selector = $(this.row.find('input.pilot-selector-container'));
      this.ship_selector.select2({
        width: '100%',
        placeholder: exportObj.translate(this.builder.language, 'ui', 'shipSelectorPlaceholder'),
        query: (function(_this) {
          return function(query) {
            _this.builder.checkCollection();
            return query.callback({
              more: false,
              results: _this.builder.getAvailableShipsMatching(query.term)
            });
          };
        })(this),
        minimumResultsForSearch: $.isMobile() ? -1 : 0,
        formatResultCssClass: (function(_this) {
          return function(obj) {
            var not_in_collection;
            if (_this.builder.collection != null) {
              not_in_collection = false;
              if ((_this.pilot != null) && obj.id === exportObj.ships[_this.pilot.ship].id) {
                if (!(_this.builder.collection.checkShelf('ship', obj.english_name) || _this.builder.collection.checkTable('pilot', obj.english_name))) {
                  not_in_collection = true;
                }
              } else {
                not_in_collection = !_this.builder.collection.checkShelf('ship', obj.english_name);
              }
              if (not_in_collection) {
                return 'select2-result-not-in-collection';
              } else {
                return '';
              }
            } else {
              return '';
            }
          };
        })(this)
      });
      this.ship_selector.on('change', (function(_this) {
        return function(e) {
          return _this.setShipType(_this.ship_selector.val());
        };
      })(this));
      this.row.attr('id', "row-" + (this.ship_selector.data('select2').container.attr('id')));
      this.pilot_selector.select2({
        width: '100%',
        placeholder: exportObj.translate(this.builder.language, 'ui', 'pilotSelectorPlaceholder'),
        query: (function(_this) {
          return function(query) {
            _this.builder.checkCollection();
            return query.callback({
              more: false,
              results: _this.builder.getAvailablePilotsForShipIncluding(_this.ship_selector.val(), _this.pilot, query.term)
            });
          };
        })(this),
        minimumResultsForSearch: $.isMobile() ? -1 : 0,
        formatResultCssClass: (function(_this) {
          return function(obj) {
            var not_in_collection, _ref;
            if (_this.builder.collection != null) {
              not_in_collection = false;
              if (obj.id === ((_ref = _this.pilot) != null ? _ref.id : void 0)) {
                if (!(_this.builder.collection.checkShelf('pilot', obj.english_name) || _this.builder.collection.checkTable('pilot', obj.english_name))) {
                  not_in_collection = true;
                }
              } else {
                not_in_collection = !_this.builder.collection.checkShelf('pilot', obj.english_name);
              }
              if (not_in_collection) {
                return 'select2-result-not-in-collection';
              } else {
                return '';
              }
            } else {
              return '';
            }
          };
        })(this)
      });
      this.pilot_selector.on('change', (function(_this) {
        return function(e) {
          _this.setPilotById(_this.pilot_selector.select2('val'));
          _this.builder.current_squad.dirty = true;
          _this.builder.container.trigger('xwing-backend:squadDirtinessChanged');
          return _this.builder.backend_status.fadeOut('slow');
        };
      })(this));
      this.pilot_selector.data('select2').results.on('mousemove-filtered', (function(_this) {
        return function(e) {
          var select2_data;
          select2_data = $(e.target).closest('.select2-result').data('select2-data');
          if ((select2_data != null ? select2_data.id : void 0) != null) {
            return _this.builder.showTooltip('Pilot', exportObj.pilotsById[select2_data.id]);
          }
        };
      })(this));
      this.pilot_selector.data('select2').container.on('mouseover', (function(_this) {
        return function(e) {
          if (_this.data != null) {
            return _this.builder.showTooltip('Ship', _this);
          }
        };
      })(this));
      this.pilot_selector.data('select2').container.hide();
      this.points_container = $(this.row.find('.points-display-container'));
      this.points_container.fadeTo(0, 0);
      this.addon_container = $(this.row.find('div.addon-container'));
      this.remove_button = $(this.row.find('button.remove-pilot'));
      this.remove_button.click((function(_this) {
        return function(e) {
          e.preventDefault();
          return _this.row.slideUp('fast', function() {
            var _ref;
            _this.builder.removeShip(_this);
            return (_ref = _this.backend_status) != null ? _ref.fadeOut('slow') : void 0;
          });
        };
      })(this));
      this.remove_button.hide();
      this.copy_button = $(this.row.find('button.copy-pilot'));
      this.copy_button.click((function(_this) {
        return function(e) {
          var clone;
          clone = _this.builder.ships[_this.builder.ships.length - 1];
          return clone.copyFrom(_this);
        };
      })(this));
      return this.copy_button.hide();
    };

    Ship.prototype.teardownUI = function() {
      this.row.text('');
      return this.row.remove();
    };

    Ship.prototype.toString = function() {
      if (this.pilot != null) {
        return "Pilot " + this.pilot.name + " flying " + this.data.name;
      } else {
        return "Ship without pilot";
      }
    };

    Ship.prototype.toHTML = function() {
      var action, action_bar, action_icons, attackHTML, effective_stats, energyHTML, html, modification, slotted_upgrades, upgrade, _i, _j, _len, _len1, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      effective_stats = this.effectiveStats();
      action_icons = [];
      _ref = effective_stats.actions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        action = _ref[_i];
        action_icons.push((function() {
          switch (action) {
            case 'Focus':
              return "<i class=\"xwing-miniatures-font xwing-miniatures-font-focus\"></i>";
            case 'Evade':
              return "<i class=\"xwing-miniatures-font xwing-miniatures-font-evade\"></i>";
            case 'Barrel Roll':
              return "<i class=\"xwing-miniatures-font xwing-miniatures-font-barrelroll\"></i>";
            case 'Target Lock':
              return "<i class=\"xwing-miniatures-font xwing-miniatures-font-targetlock\"></i>";
            case 'Boost':
              return "<i class=\"xwing-miniatures-font xwing-miniatures-font-boost\"></i>";
            case 'Coordinate':
              return "<i class=\"xwing-miniatures-font xwing-miniatures-font-coordinate\"></i>";
            case 'Jam':
              return "<i class=\"xwing-miniatures-font xwing-miniatures-font-jam\"></i>";
            case 'Recover':
              return "<i class=\"xwing-miniatures-font xwing-miniatures-font-recover\"></i>";
            case 'Reinforce':
              return "<i class=\"xwing-miniatures-font xwing-miniatures-font-reinforce\"></i>";
            case 'Cloak':
              return "<i class=\"xwing-miniatures-font xwing-miniatures-font-cloak\"></i>";
            default:
              return "<span>&nbsp;" + action + "<span>";
          }
        })());
      }
      action_bar = action_icons.join(' ');
      attackHTML = (((_ref1 = this.pilot.ship_override) != null ? _ref1.attack : void 0) != null) || (this.data.attack != null) ? $.trim("<i class=\"xwing-miniatures-font xwing-miniatures-font-attack\"></i>\n<span class=\"info-data info-attack\">" + (statAndEffectiveStat((_ref2 = (_ref3 = this.pilot.ship_override) != null ? _ref3.attack : void 0) != null ? _ref2 : this.data.attack, effective_stats, 'attack')) + "</span>") : '';
      energyHTML = (((_ref4 = this.pilot.ship_override) != null ? _ref4.energy : void 0) != null) || (this.data.energy != null) ? $.trim("<i class=\"xwing-miniatures-font xwing-miniatures-font-energy\"></i>\n<span class=\"info-data info-energy\">" + (statAndEffectiveStat((_ref5 = (_ref6 = this.pilot.ship_override) != null ? _ref6.energy : void 0) != null ? _ref5 : this.data.energy, effective_stats, 'energy')) + "</span>") : '';
      html = $.trim("<div class=\"fancy-pilot-header\">\n    <div class=\"pilot-header-text\">" + this.pilot.name + " <i class=\"xwing-miniatures-ship xwing-miniatures-ship-" + this.data.canonical_name + "\"></i></div>\n    <div class=\"mask\">\n        <div class=\"outer-circle\">\n            <div class=\"inner-circle pilot-points\">" + this.pilot.points + "</div>\n        </div>\n    </div>\n</div>\n<div class=\"fancy-pilot-stats\">\n    <div class=\"pilot-stats-content\">\n        <span class=\"info-data info-skill\">PS " + (statAndEffectiveStat(this.pilot.skill, effective_stats, 'skill')) + "</span>\n        " + attackHTML + "\n        " + energyHTML + "\n        <i class=\"xwing-miniatures-font xwing-miniatures-font-agility\"></i>\n        <span class=\"info-data info-agility\">" + (statAndEffectiveStat((_ref7 = (_ref8 = this.pilot.ship_override) != null ? _ref8.agility : void 0) != null ? _ref7 : this.data.agility, effective_stats, 'agility')) + "</span>\n        <i class=\"xwing-miniatures-font xwing-miniatures-font-hull\"></i>\n        <span class=\"info-data info-hull\">" + (statAndEffectiveStat((_ref9 = (_ref10 = this.pilot.ship_override) != null ? _ref10.hull : void 0) != null ? _ref9 : this.data.hull, effective_stats, 'hull')) + "</span>\n        <i class=\"xwing-miniatures-font xwing-miniatures-font-shield\"></i>\n        <span class=\"info-data info-shields\">" + (statAndEffectiveStat((_ref11 = (_ref12 = this.pilot.ship_override) != null ? _ref12.shields : void 0) != null ? _ref11 : this.data.shields, effective_stats, 'shields')) + "</span>\n        &nbsp;\n        " + action_bar + "\n    </div>\n</div>");
      if (this.pilot.text) {
        html += $.trim("<div class=\"fancy-pilot-text\">" + this.pilot.text + "</div>");
      }
      slotted_upgrades = ((function() {
        var _j, _len1, _ref13, _results;
        _ref13 = this.upgrades;
        _results = [];
        for (_j = 0, _len1 = _ref13.length; _j < _len1; _j++) {
          upgrade = _ref13[_j];
          if (upgrade.data != null) {
            _results.push(upgrade);
          }
        }
        return _results;
      }).call(this)).concat((function() {
        var _j, _len1, _ref13, _results;
        _ref13 = this.modifications;
        _results = [];
        for (_j = 0, _len1 = _ref13.length; _j < _len1; _j++) {
          modification = _ref13[_j];
          if (modification.data != null) {
            _results.push(modification);
          }
        }
        return _results;
      }).call(this));
      if (((_ref13 = this.title) != null ? _ref13.data : void 0) != null) {
        slotted_upgrades.push(this.title);
      }
      if (slotted_upgrades.length > 0) {
        html += $.trim("<div class=\"fancy-upgrade-container\">");
        for (_j = 0, _len1 = slotted_upgrades.length; _j < _len1; _j++) {
          upgrade = slotted_upgrades[_j];
          html += upgrade.toHTML();
        }
        html += $.trim("</div>");
      }
      return "<div class=\"fancy-ship\">" + html + "</div>";
    };

    Ship.prototype.toTableRow = function() {
      var modification, slotted_upgrades, table_html, upgrade, _i, _len, _ref;
      table_html = $.trim("<tr class=\"simple-pilot\">\n    <td class=\"name\">" + this.pilot.name + " &mdash; " + this.data.name + "</td>\n    <td class=\"points\">" + this.pilot.points + "</td>\n</tr>");
      slotted_upgrades = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.upgrades;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          upgrade = _ref[_i];
          if (upgrade.data != null) {
            _results.push(upgrade);
          }
        }
        return _results;
      }).call(this)).concat((function() {
        var _i, _len, _ref, _results;
        _ref = this.modifications;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          modification = _ref[_i];
          if (modification.data != null) {
            _results.push(modification);
          }
        }
        return _results;
      }).call(this));
      if (((_ref = this.title) != null ? _ref.data : void 0) != null) {
        slotted_upgrades.push(this.title);
      }
      if (slotted_upgrades.length > 0) {
        for (_i = 0, _len = slotted_upgrades.length; _i < _len; _i++) {
          upgrade = slotted_upgrades[_i];
          table_html += upgrade.toTableRow();
        }
      }
      table_html += '<tr><td>&nbsp;</td><td></td></tr>';
      return table_html;
    };

    Ship.prototype.toBBCode = function() {
      var bbcode, bbcode_upgrades, modification, slotted_upgrades, upgrade, upgrade_bbcode, _i, _len, _ref;
      bbcode = "[b]" + this.pilot.name + " (" + this.pilot.points + ")[/b]";
      slotted_upgrades = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.upgrades;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          upgrade = _ref[_i];
          if (upgrade.data != null) {
            _results.push(upgrade);
          }
        }
        return _results;
      }).call(this)).concat((function() {
        var _i, _len, _ref, _results;
        _ref = this.modifications;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          modification = _ref[_i];
          if (modification.data != null) {
            _results.push(modification);
          }
        }
        return _results;
      }).call(this));
      if (((_ref = this.title) != null ? _ref.data : void 0) != null) {
        slotted_upgrades.push(this.title);
      }
      if (slotted_upgrades.length > 0) {
        bbcode += "\n";
        bbcode_upgrades = [];
        for (_i = 0, _len = slotted_upgrades.length; _i < _len; _i++) {
          upgrade = slotted_upgrades[_i];
          upgrade_bbcode = upgrade.toBBCode();
          if (upgrade_bbcode != null) {
            bbcode_upgrades.push(upgrade_bbcode);
          }
        }
        bbcode += bbcode_upgrades.join("\n");
      }
      return bbcode;
    };

    Ship.prototype.toSerialized = function() {
      var addon, conferred_addons, i, modification, serialized_conferred_addons, upgrade, upgrades, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      conferred_addons = (_ref = (_ref1 = this.title) != null ? _ref1.conferredAddons : void 0) != null ? _ref : [];
      _ref2 = this.modifications;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        modification = _ref2[_i];
        conferred_addons = conferred_addons.concat((_ref3 = modification != null ? modification.conferredAddons : void 0) != null ? _ref3 : []);
      }
      upgrades = "" + ((function() {
        var _j, _len1, _ref4, _ref5, _ref6, _results;
        _ref4 = this.upgrades;
        _results = [];
        for (i = _j = 0, _len1 = _ref4.length; _j < _len1; i = ++_j) {
          upgrade = _ref4[i];
          if (__indexOf.call(conferred_addons, upgrade) < 0) {
            _results.push((_ref5 = upgrade != null ? (_ref6 = upgrade.data) != null ? _ref6.id : void 0 : void 0) != null ? _ref5 : -1);
          }
        }
        return _results;
      }).call(this));
      serialized_conferred_addons = [];
      for (_j = 0, _len1 = conferred_addons.length; _j < _len1; _j++) {
        addon = conferred_addons[_j];
        serialized_conferred_addons.push(addon.toSerialized());
      }
      return [this.pilot.id, upgrades, (_ref4 = (_ref5 = this.title) != null ? (_ref6 = _ref5.data) != null ? _ref6.id : void 0 : void 0) != null ? _ref4 : -1, (_ref7 = (_ref8 = this.modifications[0]) != null ? (_ref9 = _ref8.data) != null ? _ref9.id : void 0 : void 0) != null ? _ref7 : -1, serialized_conferred_addons.join(',')].join(':');
    };

    Ship.prototype.fromSerialized = function(version, serialized) {
      var addon_cls, addon_id, addon_type_serialized, conferred_addon, conferredaddon_pair, conferredaddon_pairs, i, modification, modification_conferred_addon_pairs, modification_id, pilot_id, title_conferred_addon_pairs, title_conferred_upgrade_ids, title_id, upgrade_id, upgrade_ids, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      switch (version) {
        case 1:
          _ref = serialized.split(':'), pilot_id = _ref[0], upgrade_ids = _ref[1], title_id = _ref[2], title_conferred_upgrade_ids = _ref[3], modification_id = _ref[4];
          this.setPilotById(parseInt(pilot_id));
          _ref1 = upgrade_ids.split(',');
          for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
            upgrade_id = _ref1[i];
            upgrade_id = parseInt(upgrade_id);
            if (upgrade_id >= 0) {
              this.upgrades[i].setById(upgrade_id);
            }
          }
          title_id = parseInt(title_id);
          if (title_id >= 0) {
            this.title.setById(title_id);
          }
          if ((this.title != null) && this.title.conferredAddons.length > 0) {
            _ref2 = title_conferred_upgrade_ids.split(',');
            for (i = _j = 0, _len1 = _ref2.length; _j < _len1; i = ++_j) {
              upgrade_id = _ref2[i];
              upgrade_id = parseInt(upgrade_id);
              if (upgrade_id >= 0) {
                this.title.conferredAddons[i].setById(upgrade_id);
              }
            }
          }
          modification_id = parseInt(modification_id);
          if (modification_id >= 0) {
            this.modifications[0].setById(modification_id);
          }
          break;
        case 2:
        case 3:
          _ref3 = serialized.split(':'), pilot_id = _ref3[0], upgrade_ids = _ref3[1], title_id = _ref3[2], modification_id = _ref3[3], conferredaddon_pairs = _ref3[4];
          this.setPilotById(parseInt(pilot_id));
          _ref4 = upgrade_ids.split(',');
          for (i = _k = 0, _len2 = _ref4.length; _k < _len2; i = ++_k) {
            upgrade_id = _ref4[i];
            upgrade_id = parseInt(upgrade_id);
            if (upgrade_id >= 0) {
              this.upgrades[i].setById(upgrade_id);
            }
          }
          title_id = parseInt(title_id);
          if (title_id >= 0) {
            this.title.setById(title_id);
          }
          modification_id = parseInt(modification_id);
          if (modification_id >= 0) {
            this.modifications[0].setById(modification_id);
          }
          if (conferredaddon_pairs != null) {
            conferredaddon_pairs = conferredaddon_pairs.split(',');
          } else {
            conferredaddon_pairs = [];
          }
          if ((this.title != null) && this.title.conferredAddons.length > 0) {
            title_conferred_addon_pairs = conferredaddon_pairs.splice(0, this.title.conferredAddons.length);
            for (i = _l = 0, _len3 = title_conferred_addon_pairs.length; _l < _len3; i = ++_l) {
              conferredaddon_pair = title_conferred_addon_pairs[i];
              _ref5 = conferredaddon_pair.split('.'), addon_type_serialized = _ref5[0], addon_id = _ref5[1];
              addon_id = parseInt(addon_id);
              addon_cls = SERIALIZATION_CODE_TO_CLASS[addon_type_serialized];
              conferred_addon = this.title.conferredAddons[i];
              if (conferred_addon instanceof addon_cls) {
                conferred_addon.setById(addon_id);
              } else {
                throw new Error("Expected addon class " + addon_cls.constructor.name + " for conferred addon at index " + i + " but " + conferred_addon.constructor.name + " is there");
              }
            }
          }
          _ref6 = this.modifications;
          for (_m = 0, _len4 = _ref6.length; _m < _len4; _m++) {
            modification = _ref6[_m];
            if (((modification != null ? modification.data : void 0) != null) && modification.conferredAddons.length > 0) {
              modification_conferred_addon_pairs = conferredaddon_pairs.splice(0, modification.conferredAddons.length);
              for (i = _n = 0, _len5 = modification_conferred_addon_pairs.length; _n < _len5; i = ++_n) {
                conferredaddon_pair = modification_conferred_addon_pairs[i];
                _ref7 = conferredaddon_pair.split('.'), addon_type_serialized = _ref7[0], addon_id = _ref7[1];
                addon_id = parseInt(addon_id);
                addon_cls = SERIALIZATION_CODE_TO_CLASS[addon_type_serialized];
                conferred_addon = modification.conferredAddons[i];
                if (conferred_addon instanceof addon_cls) {
                  conferred_addon.setById(addon_id);
                } else {
                  throw new Error("Expected addon class " + addon_cls.constructor.name + " for conferred addon at index " + i + " but " + conferred_addon.constructor.name + " is there");
                }
              }
            }
          }
      }
      return this.updateSelections();
    };

    Ship.prototype.effectiveStats = function() {
      var modification, s, stats, upgrade, _i, _j, _k, _len, _len1, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      stats = {
        skill: this.pilot.skill,
        attack: (_ref = (_ref1 = this.pilot.ship_override) != null ? _ref1.attack : void 0) != null ? _ref : this.data.attack,
        energy: (_ref2 = (_ref3 = this.pilot.ship_override) != null ? _ref3.energy : void 0) != null ? _ref2 : this.data.energy,
        agility: (_ref4 = (_ref5 = this.pilot.ship_override) != null ? _ref5.agility : void 0) != null ? _ref4 : this.data.agility,
        hull: (_ref6 = (_ref7 = this.pilot.ship_override) != null ? _ref7.hull : void 0) != null ? _ref6 : this.data.hull,
        shields: (_ref8 = (_ref9 = this.pilot.ship_override) != null ? _ref9.shields : void 0) != null ? _ref8 : this.data.shields,
        actions: ((_ref10 = (_ref11 = this.pilot.ship_override) != null ? _ref11.actions : void 0) != null ? _ref10 : this.data.actions).slice(0)
      };
      stats.maneuvers = [];
      for (s = _i = 0, _ref12 = ((_ref13 = this.data.maneuvers) != null ? _ref13 : []).length; 0 <= _ref12 ? _i < _ref12 : _i > _ref12; s = 0 <= _ref12 ? ++_i : --_i) {
        stats.maneuvers[s] = this.data.maneuvers[s].slice(0);
      }
      _ref14 = this.upgrades;
      for (_j = 0, _len = _ref14.length; _j < _len; _j++) {
        upgrade = _ref14[_j];
        if ((upgrade != null ? (_ref15 = upgrade.data) != null ? _ref15.modifier_func : void 0 : void 0) != null) {
          upgrade.data.modifier_func(stats);
        }
      }
      if (((_ref16 = this.title) != null ? (_ref17 = _ref16.data) != null ? _ref17.modifier_func : void 0 : void 0) != null) {
        this.title.data.modifier_func(stats);
      }
      _ref18 = this.modifications;
      for (_k = 0, _len1 = _ref18.length; _k < _len1; _k++) {
        modification = _ref18[_k];
        if ((modification != null ? (_ref19 = modification.data) != null ? _ref19.modifier_func : void 0 : void 0) != null) {
          modification.data.modifier_func(stats);
        }
      }
      if (((_ref20 = this.pilot) != null ? _ref20.modifier_func : void 0) != null) {
        this.pilot.modifier_func(stats);
      }
      return stats;
    };

    Ship.prototype.validate = function() {
      var func, i, max_checks, modification, upgrade, valid, _i, _j, _k, _len, _len1, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      max_checks = 128;
      for (i = _i = 0; 0 <= max_checks ? _i < max_checks : _i > max_checks; i = 0 <= max_checks ? ++_i : --_i) {
        valid = true;
        _ref = this.upgrades;
        for (_j = 0, _len = _ref.length; _j < _len; _j++) {
          upgrade = _ref[_j];
          func = (_ref1 = (_ref2 = upgrade != null ? (_ref3 = upgrade.data) != null ? _ref3.validation_func : void 0 : void 0) != null ? _ref2 : upgrade != null ? (_ref4 = upgrade.data) != null ? _ref4.restriction_func : void 0 : void 0) != null ? _ref1 : void 0;
          if ((func != null) && !func(this, upgrade)) {
            upgrade.setById(null);
            valid = false;
            break;
          }
        }
        func = (_ref5 = (_ref6 = (_ref7 = this.title) != null ? (_ref8 = _ref7.data) != null ? _ref8.validation_func : void 0 : void 0) != null ? _ref6 : (_ref9 = this.title) != null ? (_ref10 = _ref9.data) != null ? _ref10.restriction_func : void 0 : void 0) != null ? _ref5 : void 0;
        if ((func != null) && !func(this)) {
          this.title.setById(null);
          continue;
        }
        _ref11 = this.modifications;
        for (_k = 0, _len1 = _ref11.length; _k < _len1; _k++) {
          modification = _ref11[_k];
          func = (_ref12 = (_ref13 = modification != null ? (_ref14 = modification.data) != null ? _ref14.validation_func : void 0 : void 0) != null ? _ref13 : modification != null ? (_ref15 = modification.data) != null ? _ref15.restriction_func : void 0 : void 0) != null ? _ref12 : void 0;
          if ((func != null) && !func(this, modification)) {
            modification.setById(null);
            valid = false;
            break;
          }
        }
        if (valid) {
          break;
        }
      }
      return this.updateSelections();
    };

    Ship.prototype.checkUnreleasedContent = function() {
      var modification, upgrade, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      if ((this.pilot != null) && !exportObj.isReleased(this.pilot)) {
        return true;
      }
      if ((((_ref = this.title) != null ? _ref.data : void 0) != null) && !exportObj.isReleased(this.title.data)) {
        return true;
      }
      _ref1 = this.modifications;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        modification = _ref1[_i];
        if (((modification != null ? modification.data : void 0) != null) && !exportObj.isReleased(modification.data)) {
          return true;
        }
      }
      _ref2 = this.upgrades;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        upgrade = _ref2[_j];
        if (((upgrade != null ? upgrade.data : void 0) != null) && !exportObj.isReleased(upgrade.data)) {
          return true;
        }
      }
      return false;
    };

    Ship.prototype.checkEpicContent = function() {
      var modification, upgrade, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      if ((this.pilot != null) && (this.pilot.epic != null)) {
        return true;
      }
      if (((_ref = this.title) != null ? (_ref1 = _ref.data) != null ? _ref1.epic : void 0 : void 0) != null) {
        return true;
      }
      _ref2 = this.modifications;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        modification = _ref2[_i];
        if ((modification != null ? (_ref3 = modification.data) != null ? _ref3.epic : void 0 : void 0) != null) {
          return true;
        }
      }
      _ref4 = this.upgrades;
      for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
        upgrade = _ref4[_j];
        if ((upgrade != null ? (_ref5 = upgrade.data) != null ? _ref5.epic : void 0 : void 0) != null) {
          return true;
        }
      }
      return false;
    };

    Ship.prototype.toXWS = function() {
      var modification, upgrade, upgrade_obj, xws, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      xws = {
        name: this.pilot.canonical_name,
        points: this.getPoints(),
        ship: this.data.canonical_name
      };
      if (this.data.multisection) {
        xws.multisection = this.data.multisection.slice(0);
      }
      upgrade_obj = {};
      _ref = this.upgrades;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        upgrade = _ref[_i];
        if ((upgrade != null ? upgrade.data : void 0) != null) {
          upgrade.toXWS(upgrade_obj);
        }
      }
      _ref1 = this.modifications;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        modification = _ref1[_j];
        if ((modification != null ? modification.data : void 0) != null) {
          modification.toXWS(upgrade_obj);
        }
      }
      if (((_ref2 = this.title) != null ? _ref2.data : void 0) != null) {
        this.title.toXWS(upgrade_obj);
      }
      if (Object.keys(upgrade_obj).length > 0) {
        xws.upgrades = upgrade_obj;
      }
      return xws;
    };

    return Ship;

  })();

  GenericAddon = (function() {
    function GenericAddon(args) {
      this.ship = args.ship;
      this.container = $(args.container);
      this.data = null;
      this.unadjusted_data = null;
      this.conferredAddons = [];
      this.serialization_code = 'X';
      this.type = null;
      this.dataByName = null;
      this.dataById = null;
    }

    GenericAddon.prototype.destroy = function() {
      var args, cb, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      cb = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      (function(_this) {
        return (function(__iced_k) {
          var _ref;
          if (((_ref = _this.data) != null ? _ref.unique : void 0) != null) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "coffeescripts/xwing.coffee",
                funcname: "GenericAddon.destroy"
              });
              _this.ship.builder.container.trigger('xwing:releaseUnique', [
                _this.data, _this.type, __iced_deferrals.defer({
                  lineno: 2274
                })
              ]);
              __iced_deferrals._fulfill();
            })(__iced_k);
          } else {
            return __iced_k();
          }
        });
      })(this)((function(_this) {
        return function() {
          _this.selector.select2('destroy');
          return cb(args);
        };
      })(this));
    };

    GenericAddon.prototype.setupSelector = function(args) {
      this.selector = $(document.createElement('INPUT'));
      this.selector.attr('type', 'hidden');
      this.container.append(this.selector);
      if ($.isMobile()) {
        args.minimumResultsForSearch = -1;
      }
      args.formatResultCssClass = (function(_this) {
        return function(obj) {
          var not_in_collection, _ref;
          if (_this.ship.builder.collection != null) {
            not_in_collection = false;
            if (obj.id === ((_ref = _this.data) != null ? _ref.id : void 0)) {
              if (!(_this.ship.builder.collection.checkShelf(_this.type.toLowerCase(), obj.english_name) || _this.ship.builder.collection.checkTable(_this.type.toLowerCase(), obj.english_name))) {
                not_in_collection = true;
              }
            } else {
              not_in_collection = !_this.ship.builder.collection.checkShelf(_this.type.toLowerCase(), obj.english_name);
            }
            if (not_in_collection) {
              return 'select2-result-not-in-collection';
            } else {
              return '';
            }
          } else {
            return '';
          }
        };
      })(this);
      this.selector.select2(args);
      this.selector.on('change', (function(_this) {
        return function(e) {
          _this.setById(_this.selector.select2('val'));
          _this.ship.builder.current_squad.dirty = true;
          _this.ship.builder.container.trigger('xwing-backend:squadDirtinessChanged');
          return _this.ship.builder.backend_status.fadeOut('slow');
        };
      })(this));
      this.selector.data('select2').results.on('mousemove-filtered', (function(_this) {
        return function(e) {
          var select2_data;
          select2_data = $(e.target).closest('.select2-result').data('select2-data');
          if ((select2_data != null ? select2_data.id : void 0) != null) {
            return _this.ship.builder.showTooltip('Addon', _this.dataById[select2_data.id]);
          }
        };
      })(this));
      return this.selector.data('select2').container.on('mouseover', (function(_this) {
        return function(e) {
          if (_this.data != null) {
            return _this.ship.builder.showTooltip('Addon', _this.data);
          }
        };
      })(this));
    };

    GenericAddon.prototype.setById = function(id) {
      return this.setData(this.dataById[parseInt(id)]);
    };

    GenericAddon.prototype.setByName = function(name) {
      return this.setData(this.dataByName[$.trim(name)]);
    };

    GenericAddon.prototype.setData = function(new_data) {
      var ___iced_passed_deferral, __iced_deferrals, __iced_k, _ref;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      if ((new_data != null ? new_data.id : void 0) !== ((_ref = this.data) != null ? _ref.id : void 0)) {
        (function(_this) {
          return (function(__iced_k) {
            var _ref1;
            if (((_ref1 = _this.data) != null ? _ref1.unique : void 0) != null) {
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "coffeescripts/xwing.coffee",
                  funcname: "GenericAddon.setData"
                });
                _this.ship.builder.container.trigger('xwing:releaseUnique', [
                  _this.unadjusted_data, _this.type, __iced_deferrals.defer({
                    lineno: 2320
                  })
                ]);
                __iced_deferrals._fulfill();
              })(__iced_k);
            } else {
              return __iced_k();
            }
          });
        })(this)((function(_this) {
          return function() {
            _this.rescindAddons();
            (function(__iced_k) {
              if ((new_data != null ? new_data.unique : void 0) != null) {
                (function(__iced_k) {
                  __iced_deferrals = new iced.Deferrals(__iced_k, {
                    parent: ___iced_passed_deferral,
                    filename: "coffeescripts/xwing.coffee",
                    funcname: "GenericAddon.setData"
                  });
                  _this.ship.builder.container.trigger('xwing:claimUnique', [
                    new_data, _this.type, __iced_deferrals.defer({
                      lineno: 2323
                    })
                  ]);
                  __iced_deferrals._fulfill();
                })(__iced_k);
              } else {
                return __iced_k();
              }
            })(function() {
              _this.data = _this.unadjusted_data = new_data;
              if (_this.data != null) {
                if (_this.adjustment_func != null) {
                  _this.data = _this.adjustment_func(_this.data);
                }
                _this.conferAddons();
              }
              return __iced_k(_this.ship.builder.container.trigger('xwing:pointsUpdated'));
            });
          };
        })(this));
      } else {
        return __iced_k();
      }
    };

    GenericAddon.prototype.conferAddons = function() {
      var addon, args, cls, _i, _len, _ref, _results;
      if ((this.data.confersAddons != null) && this.data.confersAddons.length > 0) {
        _ref = this.data.confersAddons;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          addon = _ref[_i];
          cls = addon.type;
          args = {
            ship: this.ship,
            container: this.container
          };
          if (addon.slot != null) {
            args.slot = addon.slot;
          }
          if (addon.adjustment_func != null) {
            args.adjustment_func = addon.adjustment_func;
          }
          addon = new cls(args);
          if (addon instanceof exportObj.Upgrade) {
            this.ship.upgrades.push(addon);
          } else if (addon instanceof exportObj.Modification) {
            this.ship.modifications.push(addon);
          } else {
            throw new Error("Unexpected addon type for addon " + addon);
          }
          _results.push(this.conferredAddons.push(addon));
        }
        return _results;
      }
    };

    GenericAddon.prototype.rescindAddons = function() {
      var addon, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(_this) {
        return (function(__iced_k) {
          var _i, _len, _ref;
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "coffeescripts/xwing.coffee",
            funcname: "GenericAddon.rescindAddons"
          });
          _ref = _this.conferredAddons;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            addon = _ref[_i];
            addon.destroy(__iced_deferrals.defer({
              lineno: 2355
            }));
          }
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          var _i, _len, _ref;
          _ref = _this.conferredAddons;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            addon = _ref[_i];
            if (addon instanceof exportObj.Upgrade) {
              _this.ship.upgrades.removeItem(addon);
            } else if (addon instanceof exportObj.Modification) {
              _this.ship.modifications.removeItem(addon);
            } else {
              throw new Error("Unexpected addon type for addon " + addon);
            }
          }
          return _this.conferredAddons = [];
        };
      })(this));
    };

    GenericAddon.prototype.getPoints = function() {
      var _ref, _ref1;
      return (_ref = (_ref1 = this.data) != null ? _ref1.points : void 0) != null ? _ref : 0;
    };

    GenericAddon.prototype.updateSelection = function() {
      if (this.data != null) {
        return this.selector.select2('data', {
          id: this.data.id,
          text: "" + this.data.name + " (" + this.data.points + ")"
        });
      } else {
        return this.selector.select2('data', null);
      }
    };

    GenericAddon.prototype.toString = function() {
      if (this.data != null) {
        return "" + this.data.name + " (" + this.data.points + ")";
      } else {
        return "No " + this.type;
      }
    };

    GenericAddon.prototype.toHTML = function() {
      var attackHTML, upgrade_slot_font, _ref;
      if (this.data != null) {
        upgrade_slot_font = ((_ref = this.data.slot) != null ? _ref : this.type).toLowerCase().replace(/[^0-9a-z]/gi, '');
        attackHTML = (this.data.attack != null) ? $.trim("<div class=\"upgrade-attack\">\n    <span class=\"upgrade-attack-range\">" + this.data.range + "</span>\n    <span class=\"info-data info-attack\">" + this.data.attack + "</span>\n    <i class=\"xwing-miniatures-font xwing-miniatures-font-attack\"></i>\n</div>") : '';
        return $.trim("<div class=\"upgrade-container\">\n    <div class=\"upgrade-stats\">\n        <div class=\"upgrade-name\"><i class=\"xwing-miniatures-font xwing-miniatures-font-" + upgrade_slot_font + "\"></i> " + this.data.name + "</div>\n        <div class=\"mask\">\n            <div class=\"outer-circle\">\n                <div class=\"inner-circle upgrade-points\">" + this.data.points + "</div>\n            </div>\n        </div>\n        " + attackHTML + "\n    </div>\n    <div class=\"upgrade-text\">" + this.data.text + "</div>\n    <div style=\"clear: both;\"></div>\n</div>");
      } else {
        return '';
      }
    };

    GenericAddon.prototype.toTableRow = function() {
      if (this.data != null) {
        return $.trim("<tr class=\"simple-addon\">\n    <td class=\"name\">" + this.data.name + "</td>\n    <td class=\"points\">" + this.data.points + "</td>\n</tr>");
      } else {
        return '';
      }
    };

    GenericAddon.prototype.toBBCode = function() {
      if (this.data != null) {
        return "[i]" + this.data.name + " (" + this.data.points + ")[/i]";
      } else {
        return null;
      }
    };

    GenericAddon.prototype.toSerialized = function() {
      var _ref, _ref1;
      return "" + this.serialization_code + "." + ((_ref = (_ref1 = this.data) != null ? _ref1.id : void 0) != null ? _ref : -1);
    };

    GenericAddon.prototype.toXWS = function(upgrade_dict) {
      var upgrade_type;
      upgrade_type = (function() {
        var _ref, _ref1;
        switch (this.type) {
          case 'Upgrade':
            return (_ref = exportObj.toXWSUpgrade[this.slot]) != null ? _ref : this.slot.canonicalize();
          default:
            return (_ref1 = exportObj.toXWSUpgrade[this.type]) != null ? _ref1 : this.type.canonicalize();
        }
      }).call(this);
      return (upgrade_dict[upgrade_type] != null ? upgrade_dict[upgrade_type] : upgrade_dict[upgrade_type] = []).push(this.data.canonical_name);
    };

    return GenericAddon;

  })();

  exportObj.Upgrade = (function(_super) {
    __extends(Upgrade, _super);

    function Upgrade(args) {
      Upgrade.__super__.constructor.call(this, args);
      this.slot = args.slot;
      this.type = 'Upgrade';
      this.dataById = exportObj.upgradesById;
      this.dataByName = exportObj.upgradesByLocalizedName;
      this.serialization_code = 'U';
      if (args.adjustment_func != null) {
        this.adjustment_func = args.adjustment_func;
      }
      this.setupSelector();
    }

    Upgrade.prototype.setupSelector = function() {
      return Upgrade.__super__.setupSelector.call(this, {
        width: '50%',
        placeholder: exportObj.translate(this.ship.builder.language, 'ui', 'upgradePlaceholder', this.slot),
        allowClear: true,
        query: (function(_this) {
          return function(query) {
            _this.ship.builder.checkCollection();
            return query.callback({
              more: false,
              results: _this.ship.builder.getAvailableUpgradesIncluding(_this.slot, _this.data, _this.ship, _this, query.term)
            });
          };
        })(this)
      });
    };

    return Upgrade;

  })(GenericAddon);

  exportObj.Modification = (function(_super) {
    __extends(Modification, _super);

    function Modification(args) {
      Modification.__super__.constructor.call(this, args);
      this.type = 'Modification';
      this.dataById = exportObj.modificationsById;
      this.dataByName = exportObj.modificationsByLocalizedName;
      this.serialization_code = 'M';
      this.setupSelector();
    }

    Modification.prototype.setupSelector = function() {
      return Modification.__super__.setupSelector.call(this, {
        width: '50%',
        placeholder: exportObj.translate(this.ship.builder.language, 'ui', 'modificationPlaceholder'),
        allowClear: true,
        query: (function(_this) {
          return function(query) {
            _this.ship.builder.checkCollection();
            return query.callback({
              more: false,
              results: _this.ship.builder.getAvailableModificationsIncluding(_this.data, _this.ship, query.term)
            });
          };
        })(this)
      });
    };

    return Modification;

  })(GenericAddon);

  exportObj.Title = (function(_super) {
    __extends(Title, _super);

    function Title(args) {
      Title.__super__.constructor.call(this, args);
      this.type = 'Title';
      this.dataById = exportObj.titlesById;
      this.dataByName = exportObj.titlesByLocalizedName;
      this.serialization_code = 'T';
      this.setupSelector();
    }

    Title.prototype.setupSelector = function() {
      return Title.__super__.setupSelector.call(this, {
        width: '50%',
        placeholder: exportObj.translate(this.ship.builder.language, 'ui', 'titlePlaceholder'),
        allowClear: true,
        query: (function(_this) {
          return function(query) {
            _this.ship.builder.checkCollection();
            return query.callback({
              more: false,
              results: _this.ship.builder.getAvailableTitlesIncluding(_this.ship, _this.data, query.term)
            });
          };
        })(this)
      });
    };

    return Title;

  })(GenericAddon);

  SERIALIZATION_CODE_TO_CLASS = {
    'M': exportObj.Modification,
    'T': exportObj.Title,
    'U': exportObj.Upgrade
  };

}).call(this);

//@ sourceMappingURL=xwing.map