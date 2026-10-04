/*
 * Helper bersama untuk semua halaman CRUD: pemanggil API, escape HTML, notifikasi.
 */
(function (global) {
    'use strict';

    var BASE_URL = 'https://api.melangkah.my.id';

    function request(path, options) {
        options = options || {};
        var init = { method: options.method || 'GET', headers: {} };

        if (options.body !== undefined) {
            init.headers['Content-Type'] = 'application/json';
            init.body = JSON.stringify(options.body);
        }

        return fetch(BASE_URL + path, init).then(function (res) {
            return res.text().then(function (text) {
                var data = null;
                try { data = text ? JSON.parse(text) : null; } catch (e) { /* bukan JSON */ }

                if (!res.ok) {
                    throw new Error((data && data.message) || 'Permintaan gagal (HTTP ' + res.status + ')');
                }
                return data;
            });
        }, function () {
            throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
        });
    }

    function query(params) {
        return '?' + Object.keys(params).map(function (k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
        }).join('&');
    }

    var Api = {
        list: function (resource) {
            return request('/' + resource + '/read.php').then(function (data) {
                return Array.isArray(data) ? data : [];
            });
        },
        detail: function (resource, idField, id) {
            var p = {}; p[idField] = id;
            return request('/' + resource + '/detail.php' + query(p));
        },
        create: function (resource, body) {
            return request('/' + resource + '/create.php', { method: 'POST', body: body });
        },
        update: function (resource, body) {
            return request('/' + resource + '/update.php', { method: 'POST', body: body });
        },
        remove: function (resource, idField, id) {
            var p = {}; p[idField] = id;
            return request('/' + resource + '/delete.php' + query(p), { method: 'DELETE' });
        }
    };

    function esc(value) {
        return String(value === null || value === undefined ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function formatDate(value) {
        if (!value) { return '-'; }
        var d = new Date(value + 'T00:00:00');
        if (isNaN(d.getTime())) { return esc(value); }
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function badge(text, kind) {
        return '<span class="badge badge-' + kind + '">' + esc(text || '-') + '</span>';
    }

    function notify(type, message) {
        var $area = $('#notifyArea');
        if (!$area.length) {
            $area = $('<div id="notifyArea" style="position:fixed;top:70px;right:20px;z-index:2000;width:340px;max-width:calc(100% - 40px)"></div>')
                .appendTo('body');
        }
        var $alert = $('<div class="alert alert-' + type + ' alert-dismissible shadow fade show" role="alert"></div>')
            .text(message)
            .append('<button type="button" class="close" data-dismiss="alert" aria-label="Tutup"><span aria-hidden="true">&times;</span></button>')
            .appendTo($area);
        setTimeout(function () { $alert.alert('close'); }, 4500);
    }

    global.Api = Api;
    global.Util = { esc: esc, formatDate: formatDate, badge: badge, notify: notify };
})(window);
