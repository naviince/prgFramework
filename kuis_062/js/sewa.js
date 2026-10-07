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

    function renderDetail(r) {
        var rows = [
            ['ID Sewa', r.id_sewa],
            ['Mahasiswa', r.nama_mahasiswa + ' (' + r.nim + ')'],
            ['Jurusan', r.jurusan],
            ['Asset', r.nama_asset + ' - ' + r.kategori_asset],
            ['Jumlah', r.jumlah],
            ['Tanggal Pinjam', Util.formatDate(r.tanggal_pinjam), true],
            ['Tanggal Kembali', Util.formatDate(r.tanggal_kembali), true],
            ['Status', Util.badge(r.status_sewa || '-', STATUS_BADGE[r.status_sewa] || 'secondary'), true],
            ['Keterangan', r.keterangan || '-'],
            ['Dibuat', r.created_at]
        ];
        return '<dl class="row mb-0">' + rows.map(function (x) {
            return '<dt class="col-sm-4">' + x[0] + '</dt><dd class="col-sm-8">' + (x[2] ? x[1] : Util.esc(x[1])) + '</dd>';
        }).join('') + '</dl>';
    }

    createCrud({
        resource: 'sewa',
        idField: 'id_sewa',
        nameField: 'nama_penyewa',
        entity: 'Sewa',
        numeric: ['id_unit', 'harga/jam'],
        canEdit: false,
        canDelete: false,
        renderDetail: renderDetail,
        //  prepare: prepare,
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
            { title: 'ID Tx', data: 'id_sewa', render: function (d, t) { return t === 'display' || t === 'filter' ? Util.esc(d) : Number(d); } },
            {
                title: 'Nama Penyewa', data: 'nama_penyewa', render: function (d, t, row) {
                    return Util.esc(d) + '<br><small class="text-muted">' + Util.esc(row.tipe_ps) + '</small>';
                }
            },
            { title: 'Unit PS', data: 'unit_ps', className: 'text-right', render: Util.esc },
            { title: 'Tipe', data: 'tipe', render: function (d, t) { return t === 'display' ? Util.formatDate(d) : d; } },
            { title: 'Durasi', data: 'durasi', render: function (d, t) { return t === 'display' ? Util.formatDate(d) : d; } },
            {
                title: 'Total Bayar', data: 'total_bayar', render: function (d) {
                    return Util.badge(d || '-', STATUS_BADGE[d] || 'secondary');
                }
            },
            { title: 'Waktu Sewa', data: 'waktu', render: Util.esc }
        ]
    });
});
