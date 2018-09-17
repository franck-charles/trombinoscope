$(function() {
    $(document).ready(function() {

        var accentMap = {
            'é': 'e',
            'è': 'e',
            'ï': 'i',
            'ô': 'o',
            'ö': 'o',
        };
        var normalize = function(term) {
            var ret = "";
            for (var i = 0; i < term.length; i++) {
                ret += accentMap[term.charAt(i)] || term.charAt(i);
            }
            return ret;
        };

        function get_employee_content(user_id, user) {

            var html = '';
            phone = user["phone"];
            html += '<div class="employee_content" id="' + user_id + '">' +
                '<img src="data/' + user_id + '.jpg" class="photo" title="' + user["name"] + '"/><br>' +
                '<a href="mailto:' + user_id + '@trombinoscope.com" id="' + user_id + '" class="name" title="Nom / prénom">' + user["name"].replace(' ', '<br>') + '</a> <a href="#" id="' + user_id + '_tooltip" class="uid_tooltip">&#9432;</a></div>';
            return html;
        };

        function get_title(name_description) {
            if (name_description) {
                if (typeof name_description === 'string') {
                    return name_description
                };
                return name_description[1] + (name_description[0] != '' ? ' (' + name_description[0] + ')' : '');
            };
            return '';
        };

        function get_tooltip(user_id, employee_data) {
            phone = employee_data["phone"];
            var title = get_title(employee_data["title"]);
            return "<table>" +

                "  <th>" +
                "    <td><span class='data_employee_header'>" + employee_data["name"] + "</span></td>" +
                "  </th>" +
                "  <tr>" +
                "    <td rowspan='6'><img style='width:100px;' src='data/" + user_id + ".jpg'/></td>" +
                "    <td>&nbsp;&nbsp;&nbsp;<img class='data_employee' src='/static/img/employee.svg'/>&nbsp;&nbsp;<span class='employee_title'>" + title + "</span></td>" +
                "  </tr>" +
                "  <tr>" +
                "    <td>&nbsp;&nbsp;&nbsp;<img class='data_employee' src='/static/img/location.png'/>&nbsp;&nbsp;" + (employee_data["location"] ? '<span class="location" title="Location">' + employee_data["location"] + '</span>' : '-') + "</td>" +
                "  </tr>" +
                "  <tr>" +
                "    <td>&nbsp;&nbsp;&nbsp;<img class='data_employee' src='/static/img/department.png'/>&nbsp;&nbsp;<span class='department'>" + employee_data["departments"] + "</span></td>" +
                "  </tr>" +
                "  <tr>" +
                "    <td>&nbsp;&nbsp;&nbsp;<img class='data_employee' src='/static/img/phone.png'/>&nbsp;&nbsp;" + (employee_data["phone"] ? '<span class="internal_phone"  title="phone">' + employee_data["phone"] + '</span>' : '-') + "</td>" +
                "  </tr>" +
                "</table>" +
                "<br><br>";
        };

        $.ajax({
            dataType: "json",
            url: "data/employees.json",
        }).done(function(msg) {

            $.widget("custom.catcomplete", $.ui.autocomplete, {
                _create: function() {
                    this._super();
                    this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
                },
                _renderMenu: function(ul, items) {
                    var that = this,
                        currentCategory = "";
                    $.each(items, function(index, item) {
                        var li;
                        if (item.category != currentCategory) {
                            ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                            currentCategory = item.category;
                        }
                        li = that._renderItemData(ul, item);
                        if (item.category) {
                            li.attr("aria-label", item.category + " : " + item.label);
                        };
                    });
                }
            });
            var locations = new Array();
            var departments = new Array();
            var titles = new Array();
            var data_to_add_in_autocomplete = [
                ['Site', locations],
                ['Département', departments],
                ['Titre', titles],
            ];
            var data = [];

            function add_if_not_exists(an_array, an_item) {
                an_array.indexOf(an_item) === -1 ? an_array.push(an_item) : '';
            };

            var employees_attributes = new Array();
            $.each(msg["USERS"], function(user_id, employee_data) {

                $('#trombi_content').append(get_employee_content(user_id, employee_data));
                $("#" + user_id + '_tooltip').tooltip({
                    items: "#" + user_id,
                    tooltipClass: "employee-tooltip-style",
                    content: function() {
                        return get_tooltip(user_id, employee_data);
                    }
                });
                var name = employee_data["name"];
                var location = employee_data["location"];
                var departments_list = '';
                var title = get_title(employee_data["title"]);
                var phone = employee_data["phone"];
                $.each(employee_data["departments"], function(index, a_department) {
                    add_if_not_exists(departments, a_department);
                    if (a_department != null) {
                        departments_list += (departments_list.length == 0 ? '' : ' / ') + a_department;
                    }
                });

                employees_attributes.push(name + ' | ' + location + ' | ' + departments_list + ' | ' + user_id + ' | ' + title + ' | ' + phone);
                console.log(name + ' | Loc: ' + location + ' | Dept: ' + departments_list + ' | UID: ' + user_id + ' | Title: ' + title + ' | Phone: ' + phone);

                add_if_not_exists(locations, location);
                add_if_not_exists(titles, title);
            });
            locations.sort();
            departments.sort();
            titles.sort();
            /* Fill autocomplete list */
            $.each(data_to_add_in_autocomplete, function(i, value) {
                $.each(value[1], function(j, label) {
                    data.push({
                        label: label,
                        category: value[0]
                    });
                });
            });
            $("#employees_attributes_selection").catcomplete({
                delay: 0,
                minLength: 0,
                source: data,
                select: function(event, ui) {
                    $("#employees_attributes_selection")
                        .prop('value', ui.item.label)
                        .change();
                    return false;
                }
            }).on("change paste keyup", function() {
                var search_criterias = $.trim($(this).val()).toLowerCase().split(' ');
                $.each(employees_attributes, function(i, an_employee_attributes) {
                    component_to_hide_show = $('#' + an_employee_attributes.split(' | ')[3]);
                    component_to_hide_show.show();
                    $.each(search_criterias, function(j, a_criteria) {
                        if (normalize(an_employee_attributes.toLowerCase()).indexOf(normalize(a_criteria)) < 0) {
                            component_to_hide_show.hide();
                        };
                    });
                });
                $('#counter').html(($('.employee_content:visible').length > 1 ?
                    ' à ces personnes (total : ' + $('.employee_content:visible').length + ')' :
                    ' à cette personne'));
                var mails = '';
                $.each($('.employee_content:visible').map(function() {
                    return $(this).attr("id");
                }).get(), function(k, a_mail) {
                    mails += (mails == '' ? '' : ',') + a_mail + '@trombinoscope.com';
                });
                $('#a_mail').attr("href", "mailto:" + mails)
            }).on("click dblclick", function() {
                $(this).keydown();
            }).change();
        });
    });
});