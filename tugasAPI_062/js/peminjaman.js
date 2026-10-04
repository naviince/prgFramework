$(function () {
    'use strict';

    var STATUS_BADGE = { 'Pending': 'warning', 'Dipinjam': 'info', 'Dikembalikan': 'success' };

    function today() {
        var d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 10);
    }

    // Isi dropdown mahasiswa & asset dari API master
    function fillSelect($select, rows, valueField, textFn) {
        var html = '<option value="">-- Pilih --</option>' + rows.map(function (r) {
            return '<option value="' + Util.esc(r[valueField]) + '">' + Util.esc(textFn(r)) + '</option>';
        }).join('');
        $select.html(html);
    }

    function prepare() {
        return Promise.all([Api.list('mahasiswa'), Api.list('asset')]).then(function (res) {
            fillSelect($('#id_mahasiswa'), res[0], 'id', function (m) { return m.nim + ' - ' + m.nama; });
            fillSelect($('#id_asset'), res[1], 'id', function (a) { return a.nama_asset + ' (jumlah: ' + a.jumlah + ')'; });
        }).catch(function (err) {
            Util.notify('danger', 'Gagal memuat daftar mahasiswa/asset: ' + err.message);
        });
    }

    function renderDetail(r) {
        var rows = [
            ['ID Peminjaman', r.id_peminjaman],
            ['Mahasiswa', r.nama_mahasiswa + ' (' + r.nim + ')'],
            ['Jurusan', r.jurusan],
            ['Asset', r.nama_asset + ' - ' + r.kategori_asset],
            ['Jumlah', r.jumlah],
            ['Tanggal Pinjam', Util.formatDate(r.tanggal_pinjam), true],
            ['Tanggal Kembali', Util.formatDate(r.tanggal_kembali), true],
            ['Status', Util.badge(r.status_peminjaman || '-', STATUS_BADGE[r.status_peminjaman] || 'secondary'), true],
            ['Keterangan', r.keterangan || '-'],
            ['Dibuat', r.created_at]
        ];
        return '<dl class="row mb-0">' + rows.map(function (x) {
            return '<dt class="col-sm-4">' + x[0] + '</dt><dd class="col-sm-8">' + (x[2] ? x[1] : Util.esc(x[1])) + '</dd>';
        }).join('') + '</dl>';
    }

    createCrud({
        resource: 'peminjaman',
        idField: 'id_peminjaman',
        entity: 'Peminjaman',
        numeric: ['id_mahasiswa', 'id_asset', 'jumlah'],
        canEdit: false,
        canDelete: false,
        renderDetail: renderDetail,
        prepare: prepare,
        onOpen: function () { $('#tanggal_pinjam').val(today()); },
        validate: function () {
            var pinjam = $('#tanggal_pinjam').val();
            var kembali = $('#tanggal_kembali').val();
            if (pinjam && kembali && kembali < pinjam) {
                return 'Tanggal kembali tidak boleh lebih awal dari tanggal pinjam.';
            }
            return null;
        },
        columns: [
            { title: 'ID', data: 'id_peminjaman', render: function (d, t) { return t === 'display' || t === 'filter' ? Util.esc(d) : Number(d); } },
            { title: 'Mahasiswa', data: 'nama_mahasiswa', render: function (d, t, row) {
                return Util.esc(d) + '<br><small class="text-muted">' + Util.esc(row.nim) + '</small>';
            } },
            { title: 'Asset', data: 'nama_asset', render: function (d, t, row) {
                return Util.esc(d) + '<br><small class="text-muted">' + Util.esc(row.kategori_asset) + '</small>';
            } },
            { title: 'Jumlah', data: 'jumlah', className: 'text-right', render: Util.esc },
            { title: 'Tgl Pinjam', data: 'tanggal_pinjam', render: function (d, t) { return t === 'display' ? Util.formatDate(d) : d; } },
            { title: 'Tgl Kembali', data: 'tanggal_kembali', render: function (d, t) { return t === 'display' ? Util.formatDate(d) : d; } },
            { title: 'Status', data: 'status_peminjaman', render: function (d) {
                return Util.badge(d || '-', STATUS_BADGE[d] || 'secondary');
            } },
            { title: 'Keterangan', data: 'keterangan', render: Util.esc }
        ]
    });
});
