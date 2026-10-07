/*
 * Mesin CRUD generik: DataTable + modal tambah/ubah + modal konfirmasi hapus.
 * Tiap halaman cukup memberi konfigurasi lewat createCrud({...}).
 *
 * cfg.resource    nama endpoint, mis. 'asset'  -> /asset/read.php, dst.
 * cfg.idField     nama field primary key (juga nama field hidden di form & parameter query)
 * cfg.entity      nama untuk judul modal, mis. 'Asset'
 * cfg.columns     kolom DataTables (data/title/render)
 * cfg.numeric     field form yang dikirim sebagai angka
 * cfg.canEdit / cfg.canDelete  false untuk menyembunyikan tombol ubah / hapus (default true)
 * cfg.renderDetail(row)  (opsional) html isi modal #detailModal; mengaktifkan tombol Detail
 * cfg.label(row)  teks identitas baris pada dialog hapus
 * cfg.prepare()   (opsional) promise yang dijalankan tiap modal dibuka, mis. isi dropdown
 * cfg.validate(payload) (opsional) kembalikan string error atau null
 */
function createCrud(cfg) {
    'use strict';

    var $formModal = $('#formModal');
    var $form = $('#crudForm');
    var $saveBtn = $('#btnSave');
    var $deleteModal = $('#deleteModal');
    var pendingDeleteId = null;
    var table;

    var language = {
        search: 'Cari:',
        lengthMenu: 'Tampilkan _MENU_ data',
        info: 'Menampilkan _START_–_END_ dari _TOTAL_ data',
        infoEmpty: 'Tidak ada data',
        infoFiltered: '(disaring dari _MAX_ data)',
        zeroRecords: 'Data tidak ditemukan',
        emptyTable: 'Belum ada data',
        loadingRecords: 'Memuat data...',
        paginate: { first: 'Awal', last: 'Akhir', next: 'Berikutnya', previous: 'Sebelumnya' }
    };

    var canEdit = cfg.canEdit !== false;
    var canDelete = cfg.canDelete !== false;
    var canDetail = typeof cfg.renderDetail === 'function';

    function actionButtons(row) {
        var id = Util.esc(row[cfg.idField]);
        var html = '';
        if (canDetail) {
            html += '<button type="button" class="btn btn-info btn-sm btn-detail" data-id="' + id + '" title="Detail">' +
                        '<i class="fas fa-eye"></i></button> ';
        }
        if (canEdit) {
            html += '<button type="button" class="btn btn-warning btn-sm btn-edit" data-id="' + id + '" title="Ubah">' +
                        '<i class="fas fa-edit"></i></button> ';
        }
        if (canDelete) {
            html += '<button type="button" class="btn btn-danger btn-sm btn-delete" data-id="' + id + '" title="Hapus">' +
                        '<i class="fas fa-trash"></i></button>';
        }
        return html;
    }

    var columns = cfg.columns.slice();
    if (canDetail || canEdit || canDelete) {
        columns.push({
            title: 'Aksi', data: null, orderable: false, searchable: false,
            className: 'text-center text-nowrap', render: function (d, type, row) { return actionButtons(row); }
        });
    }

    table = $('#dataTable').DataTable({
        data: [],
        columns: columns,
        order: [[0, 'desc']],
        language: language
    });

    // ---------- Read ----------
    function reload() {
        return Api.list(cfg.resource).then(function (rows) {
            table.clear().rows.add(rows).draw();
            if (cfg.onLoaded) { cfg.onLoaded(rows); }
        }).catch(function (err) {
            Util.notify('danger', 'Gagal memuat data: ' + err.message);
        });
    }

    // ---------- Create / Update ----------
    function setMode(mode) {
        var editing = mode === 'edit';
        $('#formModalTitle').text((editing ? 'Ubah ' : 'Tambah ') + cfg.entity);
        $form.find('.lock-on-edit').prop('disabled', editing);
        $form.find('.show-on-edit').toggleClass('d-none', !editing);
    }

    function openAdd() {
        $form[0].reset();
        $form.find('[name="' + cfg.idField + '"]').val('');
        $form.removeClass('was-validated');
        Promise.resolve(cfg.prepare ? cfg.prepare() : null).then(function () {
            if (cfg.onOpen) { cfg.onOpen('add'); }
            setMode('add');
            $formModal.modal('show');
        });
    }

    function openEdit(id) {
        Promise.all([
            Api.detail(cfg.resource, cfg.idField, id),
            cfg.prepare ? cfg.prepare() : null
        ]).then(function (res) {
            var row = res[0];
            $form[0].reset();
            $form.removeClass('was-validated');
            Object.keys(row).forEach(function (name) {
                $form.find('[name="' + name + '"]').val(row[name]);
            });
            if (cfg.onOpen) { cfg.onOpen('edit', row); }
            setMode('edit');
            $formModal.modal('show');
        }).catch(function (err) {
            Util.notify('danger', 'Gagal mengambil detail: ' + err.message);
        });
    }

    function collectPayload() {
        var payload = {};
        $form.serializeArray().forEach(function (f) {
            var v = f.value.trim();
            var isNumber = f.name === cfg.idField || (cfg.numeric && cfg.numeric.indexOf(f.name) !== -1);
            if (isNumber && v !== '') { v = Number(v); }
            payload[f.name] = v;
        });
        return payload;
    }

    function save(e) {
        e.preventDefault();
        $form.addClass('was-validated');
        if (!$form[0].checkValidity()) { return; }

        var payload = collectPayload();
        var editing = payload[cfg.idField] !== '' && payload[cfg.idField] !== undefined;
        if (!editing) { delete payload[cfg.idField]; }

        var problem = cfg.validate ? cfg.validate(payload, editing) : null;
        if (problem) { Util.notify('warning', problem); return; }

        $saveBtn.prop('disabled', true).find('.spinner-border').removeClass('d-none');
        var call = editing ? Api.update(cfg.resource, payload) : Api.create(cfg.resource, payload);

        call.then(function (res) {
            $formModal.modal('hide');
            Util.notify('success', (res && res.message) || (editing ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan'));
            return reload();
        }).catch(function (err) {
            Util.notify('danger', err.message);
        }).then(function () {
            $saveBtn.prop('disabled', false).find('.spinner-border').addClass('d-none');
        });
    }

    // ---------- Delete ----------
    function askDelete(id) {
        var rows = table.rows().data().toArray();
        var row = rows.filter(function (r) { return String(r[cfg.idField]) === String(id); })[0] || {};
        pendingDeleteId = id;
        $('#deleteLabel').text(cfg.label ? cfg.label(row) : '#' + id);
        $deleteModal.modal('show');
    }

    function confirmDelete() {
        var $btn = $('#btnConfirmDelete').prop('disabled', true);
        Api.remove(cfg.resource, cfg.idField, pendingDeleteId).then(function (res) {
            $deleteModal.modal('hide');
            Util.notify('success', (res && res.message) || 'Data berhasil dihapus');
            return reload();
        }).catch(function (err) {
            $deleteModal.modal('hide');
            Util.notify('danger', 'Gagal menghapus: ' + err.message);
        }).then(function () {
            $btn.prop('disabled', false);
        });
    }

    // ---------- Wiring ----------
    $('#btnAdd').on('click', openAdd);
    $form.on('submit', save);
    $('#btnConfirmDelete').on('click', confirmDelete);
    $('#dataTable tbody')
        .on('click', '.btn-detail', function () {
            Api.detail(cfg.resource, cfg.idField, $(this).data('id')).then(function (row) {
                $('#detailBody').html(cfg.renderDetail(row));
                $('#detailModal').modal('show');
            }).catch(function (err) {
                Util.notify('danger', 'Gagal mengambil detail: ' + err.message);
            });
        })
        .on('click', '.btn-edit', function () { openEdit($(this).data('id')); })
        .on('click', '.btn-delete', function () { askDelete($(this).data('id')); });

    reload();
    return { reload: reload, table: table };
}
