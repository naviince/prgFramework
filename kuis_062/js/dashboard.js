$(function () {
    'use strict';

    var STATUS_BADGE = { 'Pending': 'warning', 'Dipinjam': 'info', 'Dikembalikan': 'success' };

    Api.list('unit').then(function (rows) { $('#statUnit').text(rows.length); })
        .catch(function () { $('#statUnit').text('!'); });

    Api.list('sewa').then(function (rows) {
        $('#statSewa').text(rows.length);
        $('#statPending').text(rows.filter(function (r) { return r.status_sewa === 'Pending'; }).length);

        var latest = rows.slice().sort(function (a, b) {
            return Number(b.id_sewa) - Number(a.id_sewa);
        }).slice(0, 5);

        if (!latest.length) {
            $('#recentBody').html('<tr><td colspan="5" class="text-center text-muted">Belum ada peminjaman</td></tr>');
            return;
        }
        $('#recentBody').html(latest.map(function (r) {
            return '<tr>' +
                '<td>' + Util.esc(r.nama_mahasiswa) + '<br><small class="text-muted">' + Util.esc(r.nim) + '</small></td>' +
                '<td>' + Util.esc(r.nama_asset) + '</td>' +
                '<td>' + Util.formatDate(r.tanggal_pinjam) + '</td>' +
                '<td>' + Util.formatDate(r.tanggal_kembali) + '</td>' +
                '<td>' + Util.badge(r.status_sewa || '-', STATUS_BADGE[r.status_sewa] || 'secondary') + '</td>' +
                '</tr>';
        }).join(''));
    }).catch(function (err) {
        $('#statSewa, #statPending').text('!');
        $('#recentBody').html('<tr><td colspan="5" class="text-center text-danger">Gagal memuat data: ' + Util.esc(err.message) + '</td></tr>');
        Util.notify('danger', 'Gagal memuat data: ' + err.message);
    });
});
