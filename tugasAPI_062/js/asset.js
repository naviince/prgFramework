$(function () {
    'use strict';

    createCrud({
        resource: 'asset',
        idField: 'id',
        entity: 'Asset',
        numeric: ['jumlah'],
        columns: [
            { title: 'ID', data: 'id', render: function (d, t) { return t === 'display' || t === 'filter' ? Util.esc(d) : Number(d); } },
            { title: 'Nama Asset', data: 'nama_asset', render: Util.esc },
            { title: 'Kategori', data: 'kategori', render: Util.esc },
            { title: 'Jumlah', data: 'jumlah', className: 'text-right', render: function (d, t) { return t === 'display' || t === 'filter' ? Util.esc(d) : Number(d); } },
            { title: 'Kondisi', data: 'kondisi', render: function (d) {
                return Util.badge(d, d === 'Baik' ? 'success' : (d === 'Rusak Ringan' ? 'warning' : 'danger'));
            } },
            { title: 'Lokasi', data: 'lokasi', render: Util.esc },
            { title: 'Status', data: 'status', render: function (d) {
                return Util.badge(d, d === 'Tersedia' ? 'success' : 'secondary');
            } }
        ],
        label: function (row) { return row.nama_asset || 'asset ini'; }
    });
});
